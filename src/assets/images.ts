// Imagens ilustrativas (Unsplash). Em produção, substituir por fotos reais da academia
// hospedadas no próprio projeto/CDN. Todos os componentes possuem fallback visual
// caso a imagem não carregue.

const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const HERO_IMAGE = u('photo-1534438327276-14e5300c3a48', 2000);
export const ABOUT_IMAGE = u('photo-1571019613454-1cb2f99b2d8b', 1200);

export const STRUCTURE_IMAGES = [
  { src: u('photo-1540497077202-7c8a3999166f', 900), title: 'Área de musculação', text: 'Equipamentos de alto padrão para todos os grupos musculares.' },
  { src: u('photo-1576678927484-cc907957088c', 900), title: 'Cardio', text: 'Esteiras, bikes e escadas com vista e climatização.' },
  { src: u('photo-1583454110551-21f2fa2afe61', 900), title: 'Peso livre', text: 'Halteres até 60 kg, racks e plataformas olímpicas.' },
  { src: u('photo-1593079831268-3381b0db4a77', 900), title: 'Funcional', text: 'Espaço amplo para treinos funcionais e mobilidade.' },
];
