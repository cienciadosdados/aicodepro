import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'leads.json');
    
    // Criar diretório se não existir
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    
    // Ler arquivo existente ou criar novo
    let leads = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        leads = JSON.parse(fileContent);
      } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        // Se o arquivo estiver corrompido, começamos com um array vazio
      }
    }
    
    // Adicionar novo lead com timestamp
    leads.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Salvar arquivo
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2));
    
    // Log para debug
    console.log(`Lead salvo em JSON: ${data.email}, Programador: ${data.isProgrammer}`);
    
    return new Response(JSON.stringify({ success: true, message: 'Lead salvo com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao salvar lead em JSON:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
