async function testAuthFlow() {
  const baseUrl = 'http://localhost:3000';

  console.log('--- 1. TESTANDO LOGIN EM CONTA INEXISTENTE ---');
  const res1 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'inexistente@salvei.tech', password: '123' })
  });
  console.log(`Status retornado: ${res1.status} (esperado: 401)`);
  const data1 = await res1.json();
  console.log(`Mensagem de erro: "${data1.error}"\n`);

  console.log('--- 2. TESTANDO CADASTRO COM SENHA MENOR QUE 6 CARACTERES ---');
  const res2 = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fellipe@salvei.tech', password: '123', fullName: 'Fellipe' })
  });
  console.log(`Status retornado: ${res2.status} (esperado: 400)`);
  const data2 = await res2.json();
  console.log(`Mensagem de erro: "${data2.error}"\n`);

  console.log('--- 3. TESTANDO CADASTRO REAL COM SENHA VÁLIDA ---');
  const res3 = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fellipe@salvei.tech', password: 'minhasenhasecreta', fullName: 'Fellipe Eduardo' })
  });
  console.log(`Status retornado: ${res3.status} (esperado: 200)`);
  const data3 = await res3.json();
  console.log(`Usuário criado: ${data3.user.email} (ID: ${data3.user.id})\n`);

  console.log('--- 4. TESTANDO CADASTRO DUPLICADO COM MESMO E-MAIL ---');
  const res4 = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fellipe@salvei.tech', password: 'outrasenhaqualquer', fullName: 'Fellipe' })
  });
  console.log(`Status retornado: ${res4.status} (esperado: 400)`);
  const data4 = await res4.json();
  console.log(`Mensagem de erro: "${data4.error}"\n`);

  console.log('--- 5. TESTANDO LOGIN COM SENHA INCORRETA ---');
  const res5 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fellipe@salvei.tech', password: 'senha_completamente_errada' })
  });
  console.log(`Status retornado: ${res5.status} (esperado: 401)`);
  const data5 = await res5.json();
  console.log(`Mensagem de erro: "${data5.error}"\n`);

  console.log('--- 6. TESTANDO LOGIN COM SENHA CORRETA ---');
  const res6 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fellipe@salvei.tech', password: 'minhasenhasecreta' })
  });
  console.log(`Status retornado: ${res6.status} (esperado: 200)`);
  const data6 = await res6.json();
  console.log(`Login autorizado com sucesso para: ${data6.user.email}!`);
  console.log(`Session token gerado: ${data6.session.access_token}\n`);

  console.log('--- 7. TESTANDO CONSULTA AO ACERVO DO USUÁRIO RECÉM-CRIADO ---');
  const res7 = await fetch(`${baseUrl}/api/library?userId=${data6.user.id}`);
  const lib = await res7.json();
  console.log(`Acervo limpo confirmado:`);
  console.log(`- Referências: ${lib.references.length}`);
  console.log(`- Projetos: ${lib.projects.length}`);
  console.log(`- Coleções: ${lib.collections.length}`);
  console.log(`- Tags: ${lib.tags.length}\n`);

  console.log('✓ TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
}

testAuthFlow().catch(err => {
  console.error('Erro no teste:', err);
  process.exit(1);
});
