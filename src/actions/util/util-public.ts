export const getFileExtension = (filename: string): string => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop() || "" : "";
};

export const addStringToFilename = (filePath: string, str: string): string => {
    const pathParts = filePath.split("/"); // Séparer le chemin du fichier
    const filename = pathParts.pop() || ""; // Récupérer le nom du fichier

    const nameParts = filename.split(".");
    if (nameParts.length > 1) {
        const extension = nameParts.pop(); // Récupère l'extension
        return `${pathParts.join("/")}/${nameParts.join(".")}_${str}.${extension}`;
    }

    return `${pathParts.join("/")}/${filename}_${str}`; // Si pas d'extension
};

export const addStringToFilenameWithNewExtension = (filePath: string, str: string, newExtension: string): string => {
    const pathParts = filePath.split("/"); // Séparer le chemin du fichier
    const filename = pathParts.pop() || ""; // Récupérer le nom du fichier

    const nameParts = filename.split(".");
    nameParts.pop(); // Supprime l'ancienne extension
    
    return `${pathParts.join("/")}/${nameParts.join(".")}_${str}.${newExtension}`;
};


export function generateToken4Chiffres(): string {
    const min = 1000; // Le minimum à 4 chiffres
    const max = 9999; // Le maximum à 4 chiffres
    const token = Math.floor(Math.random() * (max - min + 1)) + min;
    return token.toString();
}

const mimeTypes: { [key: string]: string } = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    zip: "application/zip",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function getMimeType(extension: string): string {
    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export function generateRandomFilename() {
    const timestamp = Date.now(); // Obtenir un timestamp unique
    const randomString = Math.random().toString(36).substring(2, 10); // Chaîne aléatoire
    return `file_${timestamp}_${randomString}`;
  }
  