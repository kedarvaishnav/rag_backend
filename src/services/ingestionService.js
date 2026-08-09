import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

const extractPdfText = async (filePath) => {
    const dataBuffer = await fs.readFile(filePath);

    const parser = new PDFParse({
        data: dataBuffer
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
};

export default extractPdfText;