import { storage } from "./config";
import { ref, getDownloadURL ,  uploadBytes  } from "firebase/storage";

export const uploadFileToFirebase = async (path , file)=>{
      try {
            //setreference in firebase database and upload to that location
            const storageRef = ref(storage, `${path}`);
            //upload to firebase
            await uploadBytes(storageRef , file)
      
            //get url of the uploaded file
            const url = await getDownloadURL(ref(storage,`${path}`))
      
            return url
      } catch (error) {
            return {message : error.message , error : true}
      }
}

