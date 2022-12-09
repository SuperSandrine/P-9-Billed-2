
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
function getExpenseType (){
  return screen.getByRole('combobox')
}

describe("Given I am connected as an employee",()=>{
  Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // utilise le __mocks__/localStorage.js
   window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // initialise l'user comme employee avec le localStorage
  describe("When I am on the NewBill Page", ()=>{
    test("Then, the form filled could be submitted", ()=>  { 

       // mettre en place l'environnement de test:
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store:null,
        localStorage: window.localStorage
      })

      const handleSubmit = jest.fn(
        newBillPage.handleSubmit)

      // const dropdownExpenseType = screen.getByRole('combobox')
      // console.log("test1", dropdownExpenseType)
      // user.selectOptions(dropdownExpenseType, within(dropdownExpenseType).getByRole('option',{name:'Transports'}))

      //const expenseName = screen.getByTestId("expense-name")
      //expect(expenseName.value).toBe("")

      const expenseName = screen.getByPlaceholderText(/vol paris londres/i)
      fireEvent.change(expenseName, {target:{value:'Hendaye Paris'}})
      expect(expenseName.value).toBe("Hendaye Paris")

      const datePicker =  screen.getByTestId('datepicker')
      fireEvent.change(datePicker,{target:{value :'2020-05-24'}})
      expect(datePicker.value).toBe('2020-05-24')

      const amount = screen.getByTestId("amount")
      fireEvent.change(amount,{target:{value :'800'}})
      expect(amount.value).toBe("800")

      const pct = screen.getByTestId("pct")
      fireEvent.change(pct,{target:{value :'20'}})
      expect(pct.value).toBe("20")


      const commentary = screen.getByTestId('commentary')
      fireEvent.change(commentary,{target:{value :"c'était un trajet en premiere classe"}})
      expect(commentary.value).toBe("c'était un trajet en premiere classe")


      const fileinput = screen.getByTestId("file")
      // fireEvent.change(file, {
      //   files: [
      //     new File(["image"], "chucknorris.png", 
      //     {
      //       name: "chucknorris.png",
      //       type: "image/png",
      //     }
      //     ),
      //   ],
      // })
      // expect(file).toBeTruthy("chucknorris.png")
      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      //const input = screen.getByLabelText(/upload file/i)
      userEvent.upload(fileinput, file)
    
      expect(fileinput.files[0]).toBe(file)
      expect(fileinput.files.item(0)).toBe(file)
      expect(fileinput.files).toHaveLength(1)
      

      //fireEvent.submit(form)
      //userEvent.click(screen.getByRole('button', { name: "envoyer" }))
      //userEvent.click(screen.getByText("Envoyer"))
      const form= screen.getByTestId("form-new-bill")
      form.addEventListener("submit",handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalledTimes(1)
      // checker ce que fait handle submit avec les données
      // chercker les champs required, it has 4 required fields
      // avec la required attribut
    
    })
    test("Then, it checked the File uploaded extension",  ()=>{
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store:null,
        localStorage: window.localStorage
      })

      const testHandleChangeFile= jest.fn((e) =>
        newBillPage.handleChangeFile(e));
    
        const fileInput = screen.getByTestId("file") 
        

      fileInput.addEventListener("change",testHandleChangeFile)

//       fireEvent.change(fileInput, {
//         target: {
//           Name :'chucknorris.jpeg',
// //          value: 'chucknorris.jpeg',
//         },
//       })

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["document"], "document.png", 
            {
              type: "image/png",
            }
            ),
          ],
        },
      });

      const file = screen.getByTestId("file").files[0]
      console.log("le vrai file",file)
      expect(file).not.toBe("chucknorris.jpeg")
      expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(fileInput).toHaveClass('blue-border')
      // le test fail, comme si elle passait pas à traver handle change

      

      // const file = screen.getByTestId("file")
      // fireEvent.change(file, {
      //   target: {
      //     fileName :'chucknorris.pdf',
      //   },
      // })
      // expect(file.fileName).toBe(undefined)
      //OK
      //TESTER message erreur

      // fireEvent.change(file, {
      //   target: {
      //     fileName :'chucknorris.png',
      //   },
      // })
      // expect(file.fileName).toBe("chucknorris.png")
      //   console.log(file)
      // fireEvent(
      //   file,
      //   createEvent('change', file, {
      //     target: {fileName :'chucknorris.png',},
      //     ...handleChangeFile,
      //   }),
      // )
      // expect(file.fileName).toBe("chucknorris.png")
        
    })
  })
})

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
