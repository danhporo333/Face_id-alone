import path from "path";
import { v4 } from "uuid";
import fs from "fs";
// export const uploadSingleFile = async (fileObject) => {
//   // save => public/images/upload
//   //remember to create the upload folder first
//   let uploadPath = path.resolve(__dirname, "../Public/image/student");
//   console.log("Upload path:", uploadPath);

//   let extName = path.extname(fileObject.name);
//   let baseName = path.basename(fileObject.name, extName);

//   //create final path: eg: /upload/your-image.png
//   let finalName = `${baseName}-${Date.now()}${extName}`;
//   let finalPath = `${uploadPath}/${finalName}`;

//   try {
//     await fileObject.mv(finalPath);

//     return {
//       status: "success",
//       name: finalName,
//       path: finalPath,
//       err: null,
//     };
//   } catch (error) {
//     console.log(">>> check err: ", error);
//     return {
//       status: "failed",
//       path: null,
//       err: JSON.stringify(error),
//     };
//   }
// };

// This is a helper to simulate the old fileObject.mv functionality
// for compatibility during transition
export const uploadSingleFile = async (fileObject: any) => {
  try {
    // If we receive a multer file, just return the info
    if (fileObject.filename && fileObject.path) {
      return {
        status: "success",
        name: fileObject.filename,
        path: fileObject.path,
        err: null,
      };
    }

    // For legacy code that still passes express-fileupload objects
    let uploadPath = path.resolve(__dirname, "../Public/image/student");

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    let extName = path.extname(fileObject.name);
    let baseName = path.basename(fileObject.name, extName);
    let finalName = `${baseName}-${Date.now()}${extName}`;
    let finalPath = `${uploadPath}/${finalName}`;

    // Express-fileupload style file movement
    await fileObject.mv(finalPath);

    return {
      status: "success",
      name: finalName,
      path: finalPath,
      err: null,
    };
  } catch (error) {
    console.log(">>> check err: ", error);
    return {
      status: "failed",
      path: null,
      err: JSON.stringify(error),
    };
  }
};
