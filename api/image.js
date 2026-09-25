const {supabase}=require('./_supabase');
const {userId}=require('./_auth');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const uid=await userId(req),path=String(req.query?.path||'');
  if(!uid)return res.status(401).json({error:'Not authenticated'});
  if(!path.startsWith(uid+'/'))return res.status(403).json({error:'Forbidden'});
  const r=await supabase.storage.from(process.env.SUPABASE_BUCKET||'memory-images').createSignedUrl(path,3600);
  if(r.error||!r.data?.signedUrl)return res.status(404).json({error:'Image not found'});
  return res.redirect(302,r.data.signedUrl);
};
