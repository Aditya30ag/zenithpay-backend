var jwt = require('jsonwebtoken');
const fetchuser1=(req,res,next)=>{
    const token=req.header('token1');
    if (!token){
        res.status(401).send({error:"please authenticate using a valid token"})
    }
    try {
        const data=jwt.verify(token,'shhhhh');
        req.user=data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"please authenticate using a valid token"})
    }
    
}
module.exports=fetchuser1;