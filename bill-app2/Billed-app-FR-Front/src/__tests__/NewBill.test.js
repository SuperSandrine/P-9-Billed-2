
/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, getByRole, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { user } from '@testing-library/user-event'


import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore) // je mock le Store, comme ça j'utilise mockedstore et ces données dans __tests__/store.js

// à faire: 
// handle change file
// control picture extension
// handleSubmit suite:
//  quand je clique sur submit et qu'il manque des champs required, 
//    -on reste sur la page
//    -le mes d'erreur est affiché
//  quand le submit est validé , un ticket s'ajoute?

// fleche arrière retourne à page note de frais ? NON

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock }); // utilise le __mocks__/localStorage.js
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })); // initialise l'user comme employee avec le localStorage

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // je place le DOM
  document.body.innerHTML = NewBillUI();
  //j'utilise la route de la bonne page
  window.onNavigate(ROUTES_PATH.NewBill);


});

afterEach(() => {
  document.body.innerHTML = "";
});

// const onNavigate = (pathname) => {
//   document.body.innerHTML = ROUTES({ pathname })
// }
// const newBillPage = new NewBill({
//   document,
//   onNavigate,
//   store:null,
//   localStorage: window.localStorage
// })







describe("Given I am connected as an employee",()=>{
 describe("When I am on the NewBill Page", ()=>{
  test("Then, the newBill icon should be heighlighted (in the left vertical bar)", ()=> {
    const newBillIcon = screen.getByTestId("icon-mail");
    expect(newBillIcon).toHaveClass("active-icon")
    // ma page est en place
  })

  test("Then, the form should appear",()=> {
    const form= screen.getByTestId("form-new-bill")
    expect(form).toBeTruthy()
    // mon formulaire est présent
  })

  test("Then, the form has 5 required field",()=>{ 
    // shorties//
    const expenseTypeInput = screen.getByTestId('expense-type')
    const expenseNameInput = screen.getByPlaceholderText(/vol paris londres/i)
    const datePickerInput =  screen.getByTestId('datepicker')
    const amountInput = screen.getByTestId("amount")
    const vatInput = screen.getByTestId("vat")
    const pctInput = screen.getByTestId("pct")
    const commentaryInput = screen.getByTestId('commentary')
    const fileInput = screen.getByTestId("file")
    
    expect(expenseTypeInput).toBeRequired()
    expect(datePickerInput).toBeRequired()
    expect(pctInput).toBeRequired()
    expect(amountInput).toBeRequired()
    expect(fileInput).toBeRequired()
    
    expect(expenseNameInput).not.toBeRequired()
    expect(vatInput).not.toBeRequired()
    expect(commentaryInput).not.toBeRequired()

  })
  describe("When I uploaded a file with a wrong extension",()=>{
    test("Then it should have an error message", ()=>{
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const fileInput = screen.getByTestId("file");
      const testHandleChangeFile= jest.fn((e) =>
        newBill.handleChangeFile(e));

      const fileText = new File(["foo"], "foo.txt", {
        type: "text/plain",
      });

      fileInput.addEventListener("change",testHandleChangeFile)
      userEvent.upload(fileInput, fileText)
      //console.log("fileInput", fileInput.files[0].name) // le fichier text est bien chargé

      expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(fileInput).toHaveErrorMessage(/Vérifiez l'extension: jpg, jpeg ou png sont acceptés/i)
    })
  })
      
    describe("When I uploaded a file with a right extension",()=>{
      test("Then it should not have an error message", ()=>{
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
  
        const fileInput = screen.getByTestId("file");
        const testHandleChangeFile= jest.fn((e) =>
          newBill.handleChangeFile(e));
   
        const fileJpg = new File(["img"], "Piqueture.jpg", {
          type: "image/jpg",
        });
  
        fileInput.addEventListener("change",testHandleChangeFile)
        userEvent.upload(fileInput, fileJpg)
  
        expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
        expect(fileInput).not.toHaveErrorMessage(/Vérifiez l'extension: jpg, jpeg ou png sont acceptés/i)
        expect(fileInput.files[0]).toStrictEqual(fileJpg)

        //const form= screen.getByTestId("form-new-bill")
        //const handleSubmit = jest.fn((e)=>{newBill.handleSubmit(e)})
      })
    })
  })
})


// POST :
// test d'intégration qui vérifie click et complétion de formulaire 
//bof bof bof
// faire des tests court qui contrôle les idfférentes étapes

describe("Given I am connected as an employee 2",()=>{
  describe("When I am on the Newbill Page",()=>{
    describe("When I filled in correct format all the required fields", ()=>{
      test("Then, form should be valid",  () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        
        // La capture des Inputs
        const expenseTypeInput = screen.getByTestId('expense-type')
        const datePickerInput =  screen.getByTestId('datepicker')
        const amountInput = screen.getByTestId("amount")
        const pctInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file");

        const form= screen.getByTestId("form-new-bill")

        // le fichier file valable
        const file = new File(["img"], "blabla.jpg", {
          type: ["image/jpg"],
        });
        const testHandleChangeFile= jest.fn((e) =>
        newBill.handleChangeFile(e));        
        fileInput.addEventListener("change",testHandleChangeFile)
  
        // User remplit les champs required de form
        userEvent.selectOptions(screen.getByRole('combobox'),["Transports"])
        userEvent.type(datePickerInput, "2022-02-22")
        userEvent.type(amountInput,"222")
        userEvent.type(pctInput,"20")
        userEvent.upload(fileInput, file)
                
        // le form a des valeurs valides:
        expect(form).toHaveFormValues({
          expenseType:'Transports',
          datepicker:'2022-02-22',
          amount:222,
          pct:20,
          file:""
        })

        expect(amountInput).toBeValid()
        expect(expenseTypeInput).toBeValid()
        expect(datePickerInput).toBeValid()
        expect(pctInput).toBeValid()
        expect(fileInput.files[0]).toBeDefined()
        waitFor(()=>expect(fileInput.files[0]).toBeValid())
git 
        expect(file.name).toBe("blabla.jpg")
        expect(file.type).toBe("image/jpg")
        expect(fileInput.files[0].name).toBe("blabla.jpg")
        expect(fileInput.files[0].type).toBe("image/jpg")

        expect(fileInput).toHaveClass("blue-border")
        expect(fileInput).toHaveAttribute("aria-invalid", "false")

        //fireEvent.submit(form)
        
        //expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        
      })
    })
    describe("When the form is submitted", ()=>{
      test("Then, it should render 'mes notes de frais' page, ", async  () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const form= screen.getByTestId("form-new-bill")

        const testHandleSubmit=jest.fn((e)=>newBill.handleSubmit(e))

        form.addEventListener("submit", testHandleSubmit)
        fireEvent.submit(form)
        
        expect(testHandleSubmit).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();




        // // La capture des Inputs
        // // screen.getByTestId('expense-type').value="transports"
        // // screen.getByTestId('datepicker').value='2022-02-22'
        // // screen.getByTestId("amount").value = 222
        // // screen.getByTestId("pct").value = 2
        // // newBill.fileName = "blabla.png"
        // // newBill.fileUrl = "https://localhost:3456/images/test.jpg"

        // //const fileInput = screen.getByTestId("file");

        // // le fichier file valable
        // //const file = new File(["img"], "blabla.jpg", {
        //   //type: ["image/jpg"],
        // //});
        // //const testHandleChangeFile= jest.fn((e) =>
        // //newBill.handleChangeFile(e));        
        // //fileInput.addEventListener("change",testHandleChangeFile)
        

        // const form= screen.getByTestId("form-new-bill")

        // const testHandleSubmit=jest.fn((e)=>newBill.handleSubmit(e))

        // form.addEventListener("submit", testHandleSubmit)
        // fireEvent.submit(form)
        
        // expect(testHandleSubmit).toHaveBeenCalledTimes(1)
        // expect(screen.getByText("Mes notes de frais")).toBeTruthy();

        // // ceci est un test 
        // // const submitButton = screen.getByRole("button", { name: /envoyer/i });
        // // expect(submitButton.type).toBe("submit");
        // // submitButton.addEventListener("click", testHandleSubmit)
        // // userEvent.click(submitButton)
        // // expect(testHandleSubmit).toHaveBeenCalledTimes(1)


        // //userEvent.click(submitButton)

        
        // //waitFor(()=> expect(form.checkValidity()).toBeTruthy())

        // //userEvent.click(submitButton)
        


        
      })
    })
  })
})


    // _________________________
    // _________________________
    // problème Nicola :  TypeError: Cannot read property 'value' of null
    // _________________________
    // _________________________

    // describe("When I click on submitted with an empty form",()=>{
    //   test("Then it should stay on the newBill page", async ()=>{
    //     const onNavigate = pathname => {
    //       document.body.innerHTML = ROUTES({ pathname });
    //     };
    //     const newBill = new NewBill({
    //       document,
    //       onNavigate,
    //       store: mockStore,
    //       localStorage: window.localStorage,
    //     });

    //     // const handleSubmit = jest.fn((e)=>{
    //     //   newBill.handleSubmit(e)})

    //     // const handleChangeFile = jest.fn((e)=>{
    //     //   e.preventDefault()
    //     //   newBill.handleChangeFile(e)
    //     // })
        
    //     // const expenseType = screen.getByTestId("expense-type")
    //     // expect(expenseType.value).toBe("Transports") //valeur par défaut
    //     // const datePicker = screen.getByTestId("datepicker")
    //     // expect(datePicker.value).toBe("")
    //     // const amount = screen.getByTestId("amount")
    //     // expect(amount.value).toBe("")
    //     // const pct = screen.getByTestId("pct")
    //     // expect(pct.value).toBe("")
    //     // const fileInput = screen.getByTestId("file")
    //     // expect(fileInput.files[0]).toBe(undefined)
    //     // expect(fileInput).toBeInvalid()
        
    //     const form= screen.getByTestId("form-new-bill")
    //     //const submitButton = screen.getByRole("button", { name: /envoyer/i });
    //     //expect(submitButton.type).toBe("submit");

    //     expect(form.checkValidity()).not.toBeFalsy()

    //     form.addEventListener("submit",handleSubmit)
    //     fireEvent.submit(form)

    //     //probleme avec le click
    //     //submitButton.addEventListener("click", handleSubmit)
    //     //userEvent.click(submitButton)
        
    //     //expect(handleSubmit).not.toHaveBeenCalled()

    //     ////////// expect ne marche pas, donne l'impression d'être passé sur la page bills
    //     expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    //     ///  TestingLibraryElementError: Unable to find an element with the text: Envoyer une note de frais. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    //     // NICOLAS: il y a une différence d'erreur quand je fais un fireEvent.submit ou UserEvent.click
    //   })
    // })
  //})
//})
//____________________^^
//____________________




//_______________
//_____________vv
// réécriture de la fonction submit, plus besoin de ce test
      // describe("When I uploaded a file with a wrong extension and I submitted",()=>{
      //   test("it should enlarge the error message",()=>{
      //     const onNavigate = pathname => {
      //       document.body.innerHTML = ROUTES({ pathname });
      //     };
      //     const newBill = new NewBill({
      //       document,
      //       onNavigate,
      //       store: mockStore,
      //       localStorage: window.localStorage,
      //     });

      //     const testHandleSubmit= jest.fn((e) => 
      //       newBill.handleSubmit(e));
      //     const testHandleChangeFile= jest.fn((e) =>
      //       newBill.handleChangeFile(e));
    
      //     const fileInput = screen.getByTestId("file");

      //     const fileText = new File(["foo"], "foo.txt", {
      //       type: "text/plain",
      //     });
    
      //     fileInput.addEventListener("change",testHandleChangeFile)
      //     userEvent.upload(fileInput, fileText)
      //     //console.log("fileInput", fileInput.files[0].name) // le fichier text est bien chargé
    
      //     expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
      //     expect(fileInput).toHaveErrorMessage(/Vérifiez l'extension: jpg, jpeg ou png sont acceptés/i)
          
      //     const errorMessage = screen.getByText(/Vérifiez l'extension: jpg, jpeg ou png sont acceptés/i)

      //     const submitButton = screen.getByRole("button", { name: /envoyer/i });
      //     expect(submitButton.type).toBe("submit");

      //   //form.addEventListener("submit",handleSubmit)
      //   //fireEvent.submit(form)
        
      //   submitButton.addEventListener("click", testHandleSubmit)
      //   userEvent.click(submitButton)
        
      //   expect(testHandleSubmit).toHaveBeenCalledTimes(1)
      //   expect(errorMessage).toHaveStyle({fontSize: 'large', fontWeight: 900,})

      //   // <span id="msgID" class="error-msg" style="visibility: visible; font-size: large; font-weight: 900;">Vérifiez l'extension: jpg, jpeg ou png sont acceptés</span>

      //   })
      // })      
    //})



//______________________
//______________________
//______________________ version du 14 décembre
//______________________
// // POST :
// // test d'intégration qui vérifie click et complétion de formulaire 
// describe("Given I am connected as an employee 2",()=>{
//   describe("When I am on the Newbill Page",()=>{
//     describe("When I filled in correct format all the required fields and I clicked on submit button", ()=>{
//       test("Then I should be sent on the Bills Page",  () => {
//         const onNavigate = pathname => {
//           document.body.innerHTML = ROUTES({ pathname });
//         };
//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           localStorage: window.localStorage,
//         });
        
//         // La capture des Inputs
//         const expenseNameInput = screen.getByTestId('expense-name')
//         const expenseTypeInput = screen.getByTestId('expense-type')
//         const datePickerInput =  screen.getByTestId('datepicker')
//         const amountInput = screen.getByTestId("amount")
//         const pctInput = screen.getByTestId("pct")
//         const fileInput = screen.getByTestId("file");
        
//         // le mock de la fonction submit
//         const testHandleSubmit = jest.fn((e)=>{
//           newBill.handleSubmit(e)})
//         const testHandleChangeFile= jest.fn((e) =>
//           newBill.handleChangeFile(e));

//         const testupdateBill = jest.fn(newBill.updateBill)
//         // NICOLAS: est-ce qu'on doit contrôler updateBill?
        
//         // le fichier file valable
//         const file = new File(["img"], "blabla.jpg", {
//             type: ["image/jpg"],
//         });
//         fileInput.addEventListener("change",testHandleChangeFile)
  
//         // User remplit les champs required de form et un nom de dépense
//         userEvent.type(expenseNameInput, "test-valide")
//         userEvent.selectOptions(screen.getByRole('combobox'),["Transports"])
//         userEvent.type(datePickerInput, "2022-02-22")
//         userEvent.type(amountInput,"222")
//         userEvent.type(pctInput,"20")
//         userEvent.upload(fileInput, file)
        
//         // tests sur ces champs remplis
//         //expect(file.name).toBe("blabla.jpg")
//         //expect(fileInput.files[0].name).toBe("blabla.jpg")
//         expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
        
//         expect(screen.getByRole('option', { name : 'Transports'}).selected).toBe(true)
//         expect(fileInput.files[0]).toStrictEqual(file)
//         expect(expenseNameInput.value).toBe("test-valide")
        
//         const form= screen.getByTestId("form-new-bill")
        
//         // le form a des valeurs valides:
//         expect(form).toHaveFormValues({
//           expenseName:'test-valide',
//           expenseType:'Transports',
//           datepicker:'2022-02-22',
//           amount:222,
//           pct:20,
//           file:""
//         })        
//         expect(amountInput).toBeValid()
//         expect(expenseTypeInput).toBeValid()
//         expect(datePickerInput).toBeValid()
//         expect(pctInput).toBeValid()
//         console.log("file input", fileInput.files[0].name)
//         //expect(fileInput.files[0].name).toBeValid()// Received element is not currently valid:Received element is not currently valid:        <input aria-errormessage="msgID" aria-invalid="false" class="form-control blue-border" data-testid="file" name="file" required="" type="file" />
//         //normalement il a tout pour être valide
//         //expect(fileInput.checkValidity()).toBe(true) // reçoit false
//         expect(file.name).toBe("blabla.jpg")
//         expect(file.type).toBe("image/jpg")

        
        
        
  
//         const submitButton = screen.getByRole("button", { name: /envoyer/i });
//         expect(submitButton.type).toBe("submit");
//         //////////// ça marche jusqu'ici

//         submitButton.addEventListener("click", testHandleSubmit)
//         userEvent.click(submitButton)
  
//         //form.addEventListener("submit",handleSubmit)
//         //userEvent.click(submitButton)
//         //fireEvent.submit(form)
//         // await waitFor(()=>{
//         //   submitButton.addEventListener("click", handleSubmit)
//         //   userEvent.click(submitButton)
//         //   expect(handleSubmit).toHaveBeenCalledTimes(2)

//         // })
//         //form.addEventListener("submit",handleSubmit)
//         //fireEvent.submit(form)

//         //submitButton.addEventListener("click", handleSubmit)
//         //userEvent.click(submitButton)
        
//         expect(testHandleSubmit).toHaveBeenCalledTimes(1)
//         //expect(updateBill).toHaveBeenCalled()

//         /////////////
//         //expect(screen.getByText(/Mes notes de frais/i)).toBeTruthy(); // semble être resté sur la page des newbills
//          ///// :  TestingLibraryElementError: Unable to find an element with the text: /Mes/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
//          ///// aussi erreur: 
//          //   TypeError: Cannot read property 'value' of null

//       //107 |       const bill = {
//       //  108 |         email,
//       //> 109 |         type: e.target.querySelector(`select//[data-testid="expense-type"]`).value,
//       //                            ^
        
//       })
      
//     })
// //     describe("when an error occurs on API", ()=>{
// //       test("then it should display an error message", async () => {
// //           console.error = jest.fn();
// //           window.onNavigate(ROUTES_PATH.NewBill)
// //           mockStore.bills.mockImplementationOnce(() => {
// //             return {
// //               update : () =>  {
// //                 return waitFor (()=> Promise.reject(new Error("Erreur 404")))
// //               }
// //             }})

// //             const newBill = new NewBill({
// //               document,
// //               onNavigate,
// //               store: mockStore,
// //               localStorage: window.localStorage,
// //             });
            
// //             const form= screen.getByTestId("form-new-bill")
// //             const handleSubmit = jest.fn((e)=>{
// //               newBill.handleSubmit(e)})
// //             form.addEventListener("submit",handleSubmit)
// //             fireEvent.submit(form)
// //             expect(handleSubmit).toHaveBeenCalledTimes(1)
// //             await waitFor(()=>new Promise(process.nextTick))
// //             expect(console.error).toHaveBeenCalled()

// //         })
// //     })
//    })
//  })
//__________________^^^
//__________________^^^
//__________________^^^






//____________vvv
//____________ marchait avant d'avoir changé les conditioins de handle submit
//____________
// // POST : 
// describe("Given I am connected as an employee 2",()=>{
//   describe("When I am on the Newbill Page",()=>{
//     describe("When I filled in correct format all the required fields and I clicked on submit button", ()=>{

//       test("Then I should be sent on the Bills Page",  () => {
//         const onNavigate = pathname => {
//           document.body.innerHTML = ROUTES({ pathname });
//         };
//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           localStorage: window.localStorage,
//         });
        
  
//         // La capture des Inputs
//         const expenseTypeInput = screen.getByTestId('expense-type')
//         const datePickerInput =  screen.getByTestId('datepicker')
//         const amountInput = screen.getByTestId("amount")
//         const pctInput = screen.getByTestId("pct")
//         const fileInput = screen.getByTestId("file");
        
//         // le mock de la fonction submit
//         const handleSubmit = jest.fn((e)=>{
//           newBill.handleSubmit(e)})
//         const updateBill = jest.fn(newBill.updateBill)
//         // NICOLAS: est-ce qu'on doit contrôler updateBill?
        
        
//         // le fichier file valable
//         const file = new File(["img"], "blabla.jpg", {
//             type: ["image/jpg"],
//         });
  
//         // User remplit les champs required de form
//         userEvent.selectOptions(screen.getByRole('combobox'),["Transports"])
//         userEvent.type(datePickerInput, "2022-02-22")
//         userEvent.type(amountInput,"222")
//         userEvent.type(pctInput,"20")

//         userEvent.upload(fileInput, file)
  
//         expect(file.name).toBe("blabla.jpg")
//         expect(fileInput.files[0].name).toBe("blabla.jpg")
//         expect(screen.getByRole('option', { name : 'Transports'}).selected).toBe(true)
//         expect(fileInput.files[0]).toStrictEqual(file)
//         // ^^^ça passe jusque là
        
//         const form= screen.getByTestId("form-new-bill")
        
//         // le form a des valeurs valides:
//         expect(form).toHaveFormValues({
//           expenseType:'Transports',
//           datepicker:'2022-02-22',
//           amount:222,
//           pct:20,
//         })        
//         expect(amountInput).toBeValid()
//         expect(expenseTypeInput).toBeValid()
//         expect(datePickerInput).toBeValid()
//         expect(pctInput).toBeValid()
//         //expect(fileInput).toBeValid()// Received element is not currently valid:
//         expect(file.name).toBe("blabla.jpg")
//         expect(file.type).toBe("image/jpg")


//         //<input aria-invalid="false" class="form-control blue-border" data-testid="file" name="file" required="" type="file" />
//         // il a l'aria invalid, ça veut dire qu'il ne passe pas le check-validity?
  
//         //const submitButton = screen.getByRole("button", { name: /envoyer/i });
//         //expect(submitButton.type).toBe("submit");
//         //////////// ça marche jusqu'ici

//         // submitButton.addEventListener("click", handleSubmit)
//         // userEvent.click(submitButton)
  
//         //form.addEventListener("submit",handleSubmit)
//         //userEvent.click(submitButton)
//         //fireEvent.submit(form)
//         // await waitFor(()=>{
//         //   submitButton.addEventListener("click", handleSubmit)
//         //   userEvent.click(submitButton)
//         //   expect(handleSubmit).toHaveBeenCalledTimes(2)

//         // })
//         form.addEventListener("submit",handleSubmit)
//         fireEvent.submit(form)

//         //submitButton.addEventListener("click", handleSubmit)
//         //userEvent.click(submitButton)
        
//         expect(handleSubmit).toHaveBeenCalledTimes(1)
//         //expect(updateBill).toHaveBeenCalled()

//         /////////////
//          expect(screen.getByText(/Mes notes de frais/i)).toBeTruthy(); // semble être resté sur la page des newbills
//          ///// :  TestingLibraryElementError: Unable to find an element with the text: /Mes/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
//          ///// aussi erreur: 
//          //   TypeError: Cannot read property 'value' of null

//       //107 |       const bill = {
//       //  108 |         email,
//       //> 109 |         type: e.target.querySelector(`select//[data-testid="expense-type"]`).value,
//       //                            ^
        
//       })
//     })
//   })
// })

//______________________________________ à faire
//________________________________________________
//________________________________________________
//________________________________________________
// compléter le post?
// le test d'erreur 500 => voir le cours 





//______________________________________ brouillon
//________________________________________________
//________________________________________________
//________________________________________________




//    test("Then, the form filled could be submitted", ()=>  { 

//      const handleSubmit = jest.fn(
//        newBillPage.handleSubmit)

//      // const dropdownExpenseType = screen.getByRole('combobox')
//      // console.log("test1", dropdownExpenseType)
//      // user.selectOptions(dropdownExpenseType, within(dropdownExpenseType).getByRole('option',{name:'Transports'}))

//      //const expenseName = screen.getByTestId("expense-name")
//      //expect(expenseName.value).toBe("")

//      const expenseName = screen.getByPlaceholderText(/vol paris londres/i)
//      fireEvent.change(expenseName, {target:{value:'Hendaye Paris'}})
//      expect(expenseName.value).toBe("Hendaye Paris")

//      const datePicker =  screen.getByTestId('datepicker')
//      fireEvent.change(datePicker,{target:{value :'2020-05-24'}})
//      expect(datePicker.value).toBe('2020-05-24')

//      const amount = screen.getByTestId("amount")
//      fireEvent.change(amount,{target:{value :'800'}})
//      expect(amount.value).toBe("800")

//      const pct = screen.getByTestId("pct")
//      fireEvent.change(pct,{target:{value :'20'}})
//      expect(pct.value).toBe("20")


//      const commentary = screen.getByTestId('commentary')
//      fireEvent.change(commentary,{target:{value :"c'était un trajet en premiere classe"}})
//      expect(commentary.value).toBe("c'était un trajet en premiere classe")


//      const fileinput = screen.getByTestId("file")
//      // fireEvent.change(file, {
//      //   files: [
//      //     new File(["image"], "chucknorris.png", 
//      //     {
//      //       name: "chucknorris.png",
//      //       type: "image/png",
//      //     }
//      //     ),
//      //   ],
//      // })
//      // expect(file).toBeTruthy("chucknorris.png")
//      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
//      //const input = screen.getByLabelText(/upload file/i)
//      userEvent.upload(fileinput, file) //ça amarche pas ce truc?
   
//      expect(fileinput.files[0]).toBe(file)
//      //console.log ("file test",file)
//      //console.log ("fileinput test",fileinput)
//      //console.log ("fileinput détail test",fileinput.files[0])

//      expect(fileinput.files.item(0)).toBe(file)
//      //console.log ("c'est quoi item?",fileinput.files.item(0))

//      expect(fileinput.files).toHaveLength(1)
     

//      //fireEvent.submit(form)
//      //userEvent.click(screen.getByRole('button', { name: "envoyer" }))
//      //userEvent.click(screen.getByText("Envoyer"))
//      const form= screen.getByTestId("form-new-bill")
//      //form.addEventListener("submit",handleSubmit)
//      //fireEvent.submit(form)

//      //expect(handleSubmit).toHaveBeenCalledTimes(1)
//      // checker ce que fait handle submit avec les données
//      // chercker les champs required, it has 4 required fields
//      // avec la required attribut
   
//     })
//   })
// })








//    test("Then, it checked the File uploaded extension",  ()=>{
//      document.body.innerHTML = NewBillUI()
//      const onNavigate = (pathname) => {
//        document.body.innerHTML = ROUTES({ pathname })
//      }
//      const newBillPage = new NewBill({
//        document,
//        onNavigate,
//        store:null,
//        localStorage: window.localStorage
//      })

//      const testHandleChangeFile= jest.fn((e) =>
//        newBillPage.handleChangeFile(e));
   
//        const fileInput = screen.getByTestId("file") 
       

//      fileInput.addEventListener("change",testHandleChangeFile)

// //       fireEvent.change(fileInput, {
// //         target: {
// //           Name :'chucknorris.jpeg',
// // //          value: 'chucknorris.jpeg',
// //         },
// //       })

//      fireEvent.change(fileInput, {
//        target: {
//          files: [
//            new File(["document"], "document.png", 
//            {
//              type: "image/png",
//            }
//            ),
//          ],
//        },
//      });

//      const file = screen.getByTestId("file").files[0]
//      //console.log("le vrai file",file)
//      expect(file).toBe("chucknorris.jpeg")
//      expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
//      expect(fileInput).toHaveClass('blue-border')
//      // le test fail, comme si elle passait pas à traver handle change

     

//      // const file = screen.getByTestId("file")
//      // fireEvent.change(file, {
//      //   target: {
//      //     fileName :'chucknorris.pdf',
//      //   },
//      // })
//      // expect(file.fileName).toBe(undefined)
//      //OK
//      //TESTER message erreur

//      // fireEvent.change(file, {
//      //   target: {
//      //     fileName :'chucknorris.png',
//      //   },
//      // })
//      // expect(file.fileName).toBe("chucknorris.png")
//      //   console.log(file)
//      // fireEvent(
//      //   file,
//      //   createEvent('change', file, {
//      //     target: {fileName :'chucknorris.png',},
//      //     ...handleChangeFile,
//      //   }),
//      // )
//      // expect(file.fileName).toBe("chucknorris.png")
       
//    })
//  })
// })

//})

//  describe("Given I am connected as an employee", () => {
//    Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // utilise le __mocks__/localStorage.js
//    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // initialise l'user comme employee avec le localStorage

//    afterEach
//    describe("When I do not fill fields and I click on submit", () => {    
//      test("Then, it should submit the form", () => {
//        // mettre en place l'environnement de test:
//        document.body.innerHTML = NewBillUI()

//        const onNavigate = (pathname) => {
//          document.body.innerHTML = ROUTES({ pathname })
//        }
//        // Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // utilise le __mocks__/localStorage.js
//        // window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // initialise l'user comme employee avec le localStorage
      
//        const newBillPage = new NewBill({
//          document,
//          onNavigate,
//          store:null,
//          localStorage: window.localStorage
//        })
      

//        const expenseName = screen.getByTestId("expense-name")
//        expect(expenseName.value).toBe("")
//        const datePicker = screen.getByTestId("datepicker")
//        expect(datePicker.value).toBe("")
//        const amount = screen.getByTestId("amount")
//        expect(amount.value).toBe("")
//        const pct = screen.getByTestId("pct")
//        expect(pct.value).toBe("")
//        const file = screen.getByTestId("file")
//        expect(file.value).toBe("")

//        const form= screen.getByTestId("form-new-bill")
//        const handleSubmit = jest.fn((e)=> e.preventDefault(),
//          newBillPage.handleSubmit)
//        //const handleSubmit = jest.fn((e)=> e.preventDefault())
//        form.addEventListener("submit",handleSubmit)
//        fireEvent.submit(form)
//        expect(handleSubmit).toHaveBeenCalled()
//        //const title= screen.getByTitle("")
//        //expect(screen.getByText(/Envoyer une note de frais/)).toBeTruthy()
     
//      })
//      //test il y un border rouge , du coup il y a une alert quand submit
//    })
//    describe("when I upload file with a wrong extension", () => {
//      test("Then it should display an error message", () => {
//        document.body.innerHTML = NewBillUI()
//        const onNavigate = (pathname) => {
//          document.body.innerHTML = ROUTES({ pathname })
//        }

//        const newBillPage = new NewBill({
//          document,
//          onNavigate,
//          store:null,
//          localStorage: window.localStorage
//        })

//        const file = screen.getByTestId("file")
//        expect(file.value).toBe("")

//        const handleChangeFile = jest.fn(newBillPage.handleChangeFile);


//  button.addEventListener("change", eventChangeFile);
//  fireEvent.change(button,{
//      target:{
//          files:["file.jpg"],
//          type: "image/png"
//          },
//  });

//        //const handleChangeFile = jest.fn((e)=> 
//        //  e.preventDefault(),
//        //  newBillPage.handleChangeFile)

//        file.addEventListener("change", handleChangeFile)
//          fireEvent.change(file),{
//           target:{
//              fileName:"autrechode.png"
//            }
//          }
//          expect(file.value).not.toBe("")


//      })
//    })
//  })

// note: attempting to manually set the files property of an HTMLInputElement
// results in an error as the files property is read-only.
// this feature works around that by using Object.defineProperty.
// fireEvent.change(getByLabelText(/picture/i), {
//   target: {
//     files: [new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'})],
//   },
// })

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then, it should display the newBill form", () => {
//       //const onNavigate = (pathname) => {
//       //   document.body.innerHTML = ROUTES({ pathname })
//       // }
//       // Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // utilise le __mocks__/localStorage.js
//       // window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // initialise l'user comme employee avec le localStorage
      
//       // const newBillPage = new NewBill({
//       //   document,
//       //   onNavigate,
//       //   store:null,
//       //   localStorage: window.localStorage
//       // })

//       document.body.innerHTML = NewBillUI()

//       //const form= screen.getByTestId("form-new-bill")
//       //expect(form).toHaveAttribute('data-testid="form-new-bill"');
//       const cost= screen.getByTestId("expense-type")
//       expect(cost.value).toBe("Transports")
//       const expenseName = screen.getByTestId("expense-name")
//       expect(expenseName.value).toBe("")


//     })
//   })
// })


// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page and i load a file", () => {
//     test("Then, it should filter file according jpeg, jpg and png", () => {
    
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname })
//       } 
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock }) 
//       window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

//       const html = NewBillUI()
//       document.body.innerHTML = html

//       const newBillPage = new NewBill({
//         document,
//         onNavigate,
//         store:mockStore,
//         localStorage:localStorageMock
//       })

//       const controlPictureExt = jest.fn(newBillPage.controlPictureExtension);

   
//       const fileExtension = e.target.value.split(/\./g)[e.target.value.split(/\./g).length-1]
//     console.log("fileFormat", fileExtension);
//     const controlPictureExtension = (x)=>{
//       if (x == 'jpg'|| x =='png' || x=='jpeg'){return true    
//       } else{return false}
//     }
//     const isGoodExtension = controlPictureExtension(fileExtension)
//     // console.log("alors ce format est", isGoodExtension);






//     })
//   })
// })

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ", () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//     })
//   })
// })


// const cost= screen.getByTestId("expense-type")
// expect(cost.value).toBe("Transports")
// const expenseName = screen.getByTestId("expense-name")
// expect(expenseName.value).toBe("")

// const sum = require('../containers/demo.js');

// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3);
// });
