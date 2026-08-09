import extractPdfText from "../services/ingestionService.js";


const uploadDocument = async (req, res , next) => {
    try{
        const text = await extractPdfText(req.file.path);
        res.status(201).json({
        message: "Document received",
        filename: req.file.originalname,
        textPreview: text.slice(0, 500)
    });
    }
    catch(error){
        next(error)
    }
   
    
};

export default uploadDocument;