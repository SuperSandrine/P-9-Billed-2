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
    const inputfile = this.document.querySelector(`input[data-testid="file"]`) //input
    const inputFileErrorMsg = this.document.querySelector(`.error-msg`)
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0] //le fichier

    const filePath = e.target.value.split(/\\/g) // sépare le chemin en item dans un tableau

    //------------//------------
    //------------BUG 3---------
    //------------//------------
    // DEBUG: pour contrôler l'extension du fichier: on récupérer le type de fichier avec .type, on récupère la partie après le slash pour comparaison et on valide ou non.
    // on peut aussi utilisé l'attribut 'accept' dans le html: NewBillUI.js ligne58
    // accept="image/png, image/jpg, image/jpeg"
    const fileType = document.querySelector(`input[data-testid="file"]`).files[0].type;
    const fileExtension = fileType.split(/\//g)[1];

    const controlPictureExtension = (x)=>{
      if (x == 'jpg'|| x =='png' || x=='jpeg'){return true    
      } else{return false}
    }
    const isGoodExtension = controlPictureExtension(fileExtension)

    const fileName = filePath[filePath.length-1]

    if (isGoodExtension==true){
      inputfile.classList.remove("red-border");       
      inputfile.removeAttribute("aria-invalid")
      inputfile.setAttribute("aria-invalid",false)
      inputfile.classList.add("blue-border")
      inputFileErrorMsg.style.visibility = "hidden"
      //console.log("check dans le bon scénar", inputfile.checkValidity())

      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        })
        .catch(error => console.error(error))
    }else if(isGoodExtension == false){
      inputfile.classList.remove("blue-border")
      inputfile.classList.add("red-border")
      inputfile.removeAttribute("aria-invalid")
      inputfile.setAttribute("aria-invalid",true)
      inputFileErrorMsg.style.visibility = "visible"
      inputfile.value=""
      //inputfile.setCustomValidity("Le fichier doit être en jpg, jpeg, png");
      //console.log("check dans mauvais scénar", inputfile.checkValidity())
           
  }}
  handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    
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
  }

  // not need to cover this function by tests
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