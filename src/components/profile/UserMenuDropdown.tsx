import React, { useRef, useEffect } from 'react';
import {
  User as UserIcon,
  SlidersHorizontal,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { UserProfile } from '../../types/database';

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  userEmail?: string;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenShortcuts: () => void;
  onSignOut: () => void;
  align?: 'left' | 'right';
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  isOpen,
  onClose,
  profile,
  userEmail,
  onOpenProfile,
  onOpenSettings,
  onOpenTutorial,
  onOpenShortcuts,
  onSignOut,
  align = 'right',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const emailDisplay = profile?.email || userEmail || 'Usuário';
  const nameDisplay = profile?.full_name || emailDisplay.split('@')[0] || 'Usuário';
  const initialLetter = nameDisplay.charAt(0).toUpperCase();

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 top-full mt-2 w-72 bg-white rounded-xl border border-[#E7E7E5] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
        align === 'left' ? 'left-0' : 'right-0'
      }`}
      role="menu"
      aria-label="Menu do usuário"
    >
      {/* Header with User Info */}
      <div className="p-3.5 bg-[#F8F8F6] border-b border-[#E7E7E5] flex items-center gap-3">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={nameDisplay}
            className="w-10 h-10 rounded-full object-cover border border-[#E7E7E5] bg-white shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#171717] text-white flex items-center justify-center font-display font-bold text-sm shrink-0 shadow-xs">
            {initialLetter}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="font-sans font-bold text-xs text-[#171717] truncate">
            {nameDisplay}
          </span>
          <span className="font-sans text-[11px] text-[#737373] truncate" title={emailDisplay}>
            {emailDisplay}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 font-semibold uppercase mt-0.5">
            <ShieldCheck size={10} />
            <span>Sessão Segura RLS</span>
          </span>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-1.5 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:bg-[#F1F1EF]"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <UserIcon size={14} className="text-[#737373]" />
            <span>Meu perfil</span>
          </div>
          <ChevronRight size={13} className="text-[#A8A8A6]" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:bg-[#F1F1EF]"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={14} className="text-[#737373]" />
            <span>Configurações</span>
          </div>
          <ChevronRight size={13} className="text-[#A8A8A6]" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenTutorial();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:bg-[#F1F1EF]"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={14} className="text-[#4355DB]" />
            <span>Tutorial de primeiro acesso</span>
          </div>
          <ChevronRight size={13} className="text-[#A8A8A6]" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenShortcuts();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-left outline-none focus-visible:bg-[#F1F1EF]"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={14} className="text-[#737373]" />
            <span>Atalhos de teclado (?)</span>
          </div>
          <kbd className="font-mono text-[9px] text-[#A8A8A6] bg-[#F1F1EF] px-1.5 py-0.5 rounded border border-[#E7E7E5]">
            ?
          </kbd>
        </button>
      </div>

      <div className="border-t border-[#E7E7E5] p-1.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left outline-none focus-visible:bg-rose-50"
          role="menuitem"
        >
          <LogOut size={14} className="text-rose-500" />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
};
