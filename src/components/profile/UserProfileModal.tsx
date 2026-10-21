import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  User as UserIcon,
  Shield,
  Upload,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { UserProfile } from '../../types/database';
import {
  validateDisplayName,
  validateAvatarFile,
  uploadAvatar,
  removeAvatar,
  updateUserProfile,
} from '../../services/supabaseService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  userEmail?: string;
  onProfileUpdated: (updated: UserProfile) => void;
  showToast: (message: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  userEmail,
  onProfileUpdated,
  showToast,
}) => {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when profile changes
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNameError(null);
      setPhotoError(null);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const emailDisplay = profile.email || userEmail || 'Sem e-mail';
  const initialLetter = (fullName || emailDisplay || 'U').charAt(0).toUpperCase();

  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setNameError(null);

    const validation = validateDisplayName(fullName);
    if (!validation.valid) {
      setNameError(validation.error || 'Nome inválido');
      return;
    }

    try {
      setIsSavingName(true);
      const updated = await updateUserProfile(profile.id, {
        full_name: validation.sanitizedName,
      });
      onProfileUpdated(updated);
      showToast('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setNameError(err.message || 'Não foi possível salvar o nome. Tente novamente.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    const val = validateAvatarFile(file);
    if (!val.valid) {
      setPhotoError(val.error || 'Arquivo de imagem inválido.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const { url, storagePath } = await uploadAvatar(profile.id, file, profile.avatar_url);
      const updated: UserProfile = {
        ...profile,
        avatar_url: url || storagePath,
      };
      onProfileUpdated(updated);
      showToast('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      setPhotoError(err.message || 'Não foi possível enviar a foto. Tente novamente.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile.avatar_url) return;

    try {
      setIsRemovingPhoto(true);
      setPhotoError(null);
      await removeAvatar(profile.id, profile.avatar_url);
      const updated: UserProfile = {
        ...profile,
        avatar_url: null,
      };
      onProfileUpdated(updated);
      showToast('Foto de perfil removida com sucesso.');
    } catch (err: any) {
      setPhotoError(err.message || 'Não foi possível remover a foto. Tente novamente.');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] dark:bg-[#4355DB] text-white flex items-center justify-center shadow-xs">
              <UserIcon size={16} />
            </div>
            <div>
              <h2 id="profile-modal-title" className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6]">
                Meu Perfil
              </h2>
              <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF]">
                Gerencie sua identidade visual e dados da conta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Section 1: Avatar Management */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139]">
            <div className="relative group shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName || 'Foto de perfil'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-[#2D3139] shadow-md bg-white dark:bg-[#191B20]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#171717] dark:bg-[#4355DB] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md border-2 border-white dark:border-[#2D3139]">
                  {initialLetter}
                </div>
              )}

              {/* Uploading overlay */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start gap-2 flex-1 text-center sm:text-left">
              <span className="font-sans font-semibold text-sm text-[#171717] dark:text-[#F3F4F6]">
                Foto de Perfil
              </span>
              <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
                Envie uma foto em PNG, JPG ou WebP de até 5 MB para personalizar sua experiência.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto || isRemovingPhoto}
                  iconLeft={
                    isUploadingPhoto ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )
                  }
                >
                  {profile.avatar_url ? 'Substituir foto' : 'Enviar foto'}
                </Button>

                {profile.avatar_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto || isRemovingPhoto}
                    iconLeft={
                      isRemovingPhoto ? (
                        <Loader2 size={13} className="animate-spin text-rose-500" />
                      ) : (
                        <Trash2 size={13} className="text-rose-500" />
                      )
                    }
                    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          {photoError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{photoError}</span>
            </div>
          )}

          {/* Section 2: Personal Information */}
          <form onSubmit={handleSaveName} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="profile-fullname"
                className="block text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] mb-1.5"
              >
                Nome de Exibição
              </label>
              <div className="relative">
                <input
                  id="profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  maxLength={50}
                  placeholder="Seu nome ou apelido profissional"
                  className={`w-full h-10 px-3.5 rounded-lg bg-[#F8F8F6] dark:bg-[#20232A] border text-xs text-[#171717] dark:text-[#F3F4F6] outline-none transition-colors ${
                    nameError
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-[#E7E7E5] dark:border-[#2D3139] focus:border-[#4355DB] focus:bg-white dark:focus:bg-[#15171C] focus:ring-2 focus:ring-[#4355DB]/15'
                  }`}
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-[#A8A8A6] dark:text-[#6B7280]">
                  {fullName.length}/50
                </span>
              </div>
              {nameError && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-[#171717] dark:text-[#F3F4F6] mb-1.5">
                Endereço de E-mail
              </label>
              <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-[#F1F1EF] dark:bg-[#15171C] border border-[#E7E7E5] dark:border-[#2D3139] text-xs text-[#737373] dark:text-[#9CA3AF] cursor-not-allowed">
                <Mail size={14} className="text-[#A8A8A6] dark:text-[#6B7280] shrink-0" />
                <span className="truncate select-all">{emailDisplay}</span>
                <span className="ml-auto text-[10px] font-mono text-[#737373] dark:text-[#9CA3AF] bg-[#E7E7E5] dark:bg-[#2D3139] px-1.5 py-0.5 rounded">
                  Autenticado
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#A8A8A6] dark:text-[#6B7280]">
                O e-mail é vinculado à sua conta de autenticação e não pode ser alterado por aqui.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSavingName}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSavingName || !fullName.trim()}
                iconLeft={
                  isSavingName ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )
                }
              >
                {isSavingName ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
