// storage.js
// Importaciones necesarias
import { storage, auth, db } from './firestone.js';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Función para mostrar detalles del archivo seleccionado en la interfaz
function showSelectedFile(file) {
  const fileList = document.getElementById('fileList');
  const fileElement = document.createElement('div');
  fileElement.classList.add('file-item');
  fileElement.innerHTML = `
    <img src="../img/main/pdf.png" alt="PDF Icon" style="width: 27px; height: 27px;">
    <span class="file-text">${file.name} - ${(file.size / 1024).toFixed(2)} KB</span>
    <button class="confirm-upload" data-name="${file.name}">Confirmar subida</button>
  `;
  fileList.appendChild(fileElement);
}

// Función para manejar la subida de archivos
function confirmFileUpload(userId, fileName, button) {
  const fileRef = storageRef(storage, `usuarios/${userId}/archivos/${fileName}`);
  const uploadTask = uploadBytesResumable(fileRef, window.appState.selectedFile);
  
  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Subida es ' + progress + '% completada');
    }, 
    (error) => {
      console.error("Error al subir archivo:", error);
    }, 
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('Archivo disponible en', downloadURL);
        const fileData = {
          name: fileName,
          url: downloadURL,
          createdAt: new Date()
        };

        const userFilesRef = doc(db, "uploadedFiles", userId);
        updateDoc(userFilesRef, {
          files: arrayUnion(fileData)
        }).then(() => {
          console.log("Archivo confirmado y subido correctamente.");
          if (button) {
            button.style.display = 'none';
          }
          window.appState.selectedFile = null;
          fileList.innerHTML = '';
          // llamaré a loadAndDisplayFiles para mostrar los archivos actualizados
          loadAndDisplayFiles(userId);
        }).catch((error) => {
          console.error("Error al actualizar Firestore con la información del archivo:", error);
        });
      });
    }
  );
}

// Función para cargar y mostrar archivos
function loadAndDisplayFiles(userId) {
  const filesRef = doc(db, "uploadedFiles", userId);

  getDoc(filesRef).then((docSnapshot) => {
    if (docSnapshot.exists()) {
      const files = docSnapshot.data().files || [];
      const filesList = document.getElementById('yourFilesList');
      filesList.innerHTML = '';

      files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.classList.add('file-entry');
        fileElement.innerHTML = `
          <input type="checkbox" class="delete-checkbox" data-name="${file.name}" />
          <img src="../img/main/pdf.png" alt="PDF Icon" style="width: 27px; height: 27px;">
          <a href="${file.url}" target="_blank" class="file-text">${file.name}</a>
        `;
        filesList.appendChild(fileElement);
      });

      // Event listener poara los checkboxes para manejar la eliminación
      document.querySelectorAll('.delete-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
          if (event.target.checked) {
            const fileName = event.target.dataset.name;
            deleteFile(fileName, userId, event.target);
          }
        });
      });

    } else {
      console.log("No se encontraron archivos.");
    }
  }).catch((error) => {
    console.error("Error al cargar archivos:", error);
  });
}

// función para manejar la eliminación de archivos
function deleteFile(fileName, userId, checkboxElement) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el archivo ${fileName}?`)) {
    checkboxElement.checked = false;
    return;
  }
  
  const fileRef = storageRef(storage, `usuarios/${userId}/archivos/${fileName}`);
  deleteObject(fileRef).then(() => {
    console.log(`${fileName} ha sido eliminado de Firebase Storage.`);
    const userFilesRef = doc(db, "uploadedFiles", userId);

    getDoc(userFilesRef).then(docSnapshot => {
      if (docSnapshot.exists()) {
        const updatedFiles = docSnapshot.data().files.filter(file => file.name !== fileName);
        updateDoc(userFilesRef, { files: updatedFiles }).then(() => {
          console.log(`${fileName} ha sido eliminado de Firestore.`);
          checkboxElement.parentElement.remove();
        }).catch(error => {
          console.error("Error al eliminar el archivo de Firestore:", error);
        });
      }
    });
  }).catch(error => {
    console.error("Error al eliminar el archivo de Firebase Storage:", error);
  });
}
export { deleteFile, loadAndDisplayFiles, showSelectedFile, confirmFileUpload };
