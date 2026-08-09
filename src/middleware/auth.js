import { env } from "../config/env.js";


function auth( req , res , next){


    const token = req.headers.authorization;

    if(token===env.AUTH){
        next();
    }
    else {
        res.status(401).json({
            message: "Unauthorized"
        });
    }
    
}

export default auth ;