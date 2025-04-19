/**
 * Serviço de armazenamento de leads usando uma API externa
 * Esta solução não depende do módulo pg, evitando problemas de build na Vercel
 */

import axios from 'axios';

// URL da API externa para salvar leads (usando um serviço de banco de dados como proxy)
const LEAD_API_URL = 'https://api.cienciadosdados.com/store-lead';

/**
 * Salva um lead qualificado usando uma API externa
 * @param {Object} leadData - Dados do lead a ser salvo
 * @returns {Promise<Object>} - Objeto com os dados do lead salvo
 */
export async function saveQualifiedLeadExternal(leadData) {
  const { email, phone, isProgrammer, utmSource, utmMedium, utmCampaign, ipAddress, userAgent } = leadData;
  
  // Normalizar isProgrammer para garantir que seja um booleano válido
  const normalizedIsProgrammer = isProgrammer === true || 
                              isProgrammer === 'true' || 
                              isProgrammer === 1 || 
                              isProgrammer === '1';
  
  // Log para depuração
  console.log('📝 Salvando lead qualificado via API externa:');
  console.log('- Email:', email);
  console.log('- Telefone:', phone);
  console.log('- É programador:', normalizedIsProgrammer);
  
  try {
    // Preparar dados para envio
    const payload = {
      email,
      phone,
      isProgrammer: normalizedIsProgrammer,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      timestamp: new Date().toISOString(),
      source: 'aicodepro-website'
    };
    
    // Enviar dados para a API externa
    const response = await axios.post(LEAD_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.LEAD_API_KEY || 'dev-mode'
      },
      timeout: 5000 // 5 segundos de timeout
    });
    
    // Verificar resposta
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Lead salvo com sucesso via API externa:', email);
      return {
        success: true,
        email,
        phone,
        isProgrammer: normalizedIsProgrammer,
        savedAt: new Date().toISOString(),
        id: response.data.id || 'generated-id-' + Date.now()
      };
    } else {
      throw new Error(`API retornou status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar lead via API externa:', error.message);
    
    // Salvar em localStorage como fallback (apenas para ambiente de desenvolvimento)
    if (typeof window !== 'undefined') {
      try {
        const storedLeads = JSON.parse(localStorage.getItem('qualified_leads') || '[]');
        storedLeads.push({
          email,
          phone,
          isProgrammer: normalizedIsProgrammer,
          savedAt: new Date().toISOString(),
          id: 'local-' + Date.now()
        });
        localStorage.setItem('qualified_leads', JSON.stringify(storedLeads));
        console.log('📦 Lead salvo localmente como fallback');
      } catch (storageError) {
        console.error('Erro ao salvar no localStorage:', storageError.message);
      }
    }
    
    // Retornar objeto simulado para manter a aplicação funcionando
    return {
      success: false,
      error: error.message,
      email,
      phone,
      isProgrammer: normalizedIsProgrammer,
      savedAt: new Date().toISOString(),
      id: 'error-' + Date.now()
    };
  }
}

/**
 * Função alternativa que tenta salvar o lead usando ambos os métodos
 * Primeiro tenta usar o método direto com pg, depois o método via API externa
 */
export async function saveQualifiedLeadHybrid(leadData) {
  try {
    // Tentar importar o método original
    const { saveQualifiedLead } = await import('./lead-storage');
    
    // Tentar salvar usando o método original
    return await saveQualifiedLead(leadData);
  } catch (error) {
    console.warn('Não foi possível usar o método direto de armazenamento. Usando API externa:', error.message);
    
    // Fallback para o método via API externa
    return await saveQualifiedLeadExternal(leadData);
  }
}
