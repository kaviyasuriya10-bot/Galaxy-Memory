const {clearCookie}=require('./_auth');module.exports=(req,res)=>{if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});clearCookie(res);res.json({ok:true})};
