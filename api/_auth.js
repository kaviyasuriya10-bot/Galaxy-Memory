const {SignJWT,jwtVerify}=require('jose');
const key=()=>new TextEncoder().encode(process.env.SESSION_SECRET||'');
async function token(id){return new SignJWT({sub:id}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(key())}
async function userId(req){const m=(req.headers.cookie||'').match(/(?:^|;\s*)milky_session=([^;]+)/);if(!m)return null;try{return (await jwtVerify(decodeURIComponent(m[1]),key())).payload.sub||null}catch{return null}}
function setCookie(res,t){res.setHeader('Set-Cookie',`milky_session=${encodeURIComponent(t)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`)}
function clearCookie(res){res.setHeader('Set-Cookie','milky_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0')}
module.exports={token,userId,setCookie,clearCookie};
