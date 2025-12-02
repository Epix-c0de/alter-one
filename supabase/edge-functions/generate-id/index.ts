import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const handler = async (req: Request): Promise<Response> => {
  const { type, name, parentId } = await req.json();

  // Basic AI-powered ID generation (can be expanded)
  const generateId = () => {
    const shortcode = name.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    if (type === 'archdiocese') {
      return `ARCH_${shortcode}_${randomNumber}`;
    }
    if (type === 'parish') {
      return `PAR_${parentId ? parentId.split('_')[1] : shortcode}_${randomNumber}`;
    }
    if (type === 'local_church') {
      const parishShortcode = parentId ? parentId.split('_')[1] : shortcode;
      return `LC_${parishShortcode}_${randomNumber}`;
    }
    return null;
  };

  const newId = generateId();

  if (!newId) {
    return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ id: newId }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

serve(handler);
