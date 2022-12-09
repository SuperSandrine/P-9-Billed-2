import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const inputfile = this.document.querySelector(`input[data-testid="file"]`)
    const inputFileErrorMsg = this.document.querySelector(`.error-msg`)
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    console.log("file", file);//input
    console.log("file ssans files[0]", this.document.querySelector(`input[data-testid="file"]`));//fichier dans l'input

    const filePath = e.target.value.split(/\\/g)
    console.log("filepath", filePath);
    // DEBUG: pour contrôler l'extension: avec la méthode de la const filePatth
    // on récupère le dernier item du tableau (const fileExtension)
    // et on vérifie que c'est bien les formats acceptés (const controlPictureExtension(fileExtension))
    // affiche une ligne rouge si le format est mauvais
    // on peut aussi utilisé l'attribut 'accept' dans le html: NewBillUI.js ligne58
    // accept="image/png, image/jpg, image/jpeg"
    // Pour contrôle du fichier on peut aussi utilisé le type:
     const fileType = document.querySelector(`input[data-testid="file"]`).files[0].type;
    // console.log("type", fileType);
    // const fileExtension = e.target.value.split(/\./g)[e.target.value.split(/\./g).length-1]
    const fileExtension = fileType.split(/\//g)[1];
    //const fileExtension = e.target.value.split(/\./g)[e.target.value.split(/\./g).length-1]
    console.log("fileext", fileExtension);
    console.log("e", e);

    console.log("file", e.target);
    console.log("file value", e.target.value);



    const controlPictureExtension = (x)=>{
      if (x == 'jpg'|| x =='png' || x=='jpeg'){return true    
      } else{return false}
    }
    const isGoodExtension = controlPictureExtension(fileExtension)
    // console.log("alors ce format est", isGoodExtension);
    const fileName = filePath[filePath.length-1]
    //console.log("fileName", fileName);
    const formData = new FormData()
    //console.log("formData", formData);
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    //console.log("formData2", formData);
    
    if (isGoodExtension){
      inputfile.classList.remove("red-border");      inputfile.removeAttribute("aria-invalid")
      inputfile.classList.add("blue-border")
      inputFileErrorMsg.style.visibility = "hidden"
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
        //  console.log("fileUrl", fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        })
        .catch(error => console.error(error))
    }else if(!isGoodExtension){
      //console.log("mauvais type de fichier, qui es-tu file?",inputfile)
      inputfile.classList.remove("blue-border")
      inputfile.classList.add("red-border")
      inputfile.setAttribute("aria-invalid",true)
      inputFileErrorMsg.style.visibility = "visible"      
  }}
  handleSubmit = e => {
    const inputfile = this.document.querySelector(`input[data-testid="file"]`)
    console.log("linput",inputfile)
    const inputFileErrorMsg = this.document.querySelector(`.error-msg`)
    e.preventDefault()
    if(inputfile.classList.contains("red-border")){
      inputFileErrorMsg.style.fontSize = "large"
      inputFileErrorMsg.style.fontWeight = "900"      
    }else{
      //console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
  }}

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}