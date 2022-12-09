/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore) // je mock le Store, comme ça j'utilise mockedstore et ces données dans __tests__/store.js


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given I am on the Bills page", () => {
  describe("When I click on NewBill button",() => {
    test("Then, it should sent me on the newBill page",() => {
      // ---création de l'environnement de test
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      } // TOUN: ça je sais pas à quoi ça sert car il n'y a pathname dedans, pas de direction concrète ? (pourquoi il n'y a pas newbill page)
      Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // utilise le __mocks__/localStorage.js
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // initialise l'user comme employee avec le localStorage
      // ---
      // mise en place de la class pour test à partir de l'environnemnet simulé
      const billsPage = new Bills({
        document, 
        onNavigate, 
        store:null, 
        localStorage:localStorageMock
      })
      // NICOLAS: pourquoi store = null et pas store: mockedbills? parce que on n'a pas besoin des donnees du store pour ce test
      document.body.innerHTML = BillsUI({ data:bills }) // affiche la page bills
      const handleClickNewBill = jest.fn(billsPage.handleClickNewBill) // mock la fonction

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      // ou 
      //  const buttonNewBill = document.getByTestId("btn-new-bill")
      buttonNewBill.addEventListener('click',handleClickNewBill)
      userEvent.click(buttonNewBill)

      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})
describe("Given I am on the Bills page", () => {
  describe("When I click on IconEye Button", () => {
    test("Then, It should open the modal", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      const billsPage = new Bills({
        document, 
        onNavigate, 
        store:mockStore, 
        localStorage:localStorageMock
      }) // NICOLAS: est-ce que localStorageMock c'est la même chose que window.localStorage
      document.body.innerHTML = BillsUI({ data:bills })
      $.fn.modal = jest.fn(); // fonction mocké de jquery
      
      const handleClickIcon = jest.fn((e) => billsPage.handleClickIconEye(e)) // mock de la fonction, ou mock d'un fonction avec paramètre
      // TOUN: NICOLAS: comment fonctionne le mock d'une fonction à paramètre

      //const iconEyes = screen.getAllByTestId('icon-eye')// renvoie error reference
      const iconEyes = document.querySelectorAll('[data-testid="icon-eye"]')
      // iconEyes[0].addEventListener('click', () => handleClickIcon(iconEyes[0])) // ça marche car il y a un paramètre.
      iconEyes.forEach(icon => {
        icon.addEventListener("click", () => 
          handleClickIcon(icon)
        )
      }); //TOUN= NICOLAS= et ensuite comment on l'utilise? 
      // pourquoi ligne 15 pas validée
      
      userEvent.click(iconEyes[0])
      
      expect(handleClickIcon).toHaveBeenCalled()
      expect(screen.getByText('Justificatif')).toBeTruthy()
    })
  })
})


describe("Given I am a user connected as Employee",() => {
  describe("When I navigate to Bills Page", () => {
    test("Then, it should fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type:"Employee", email:"a@a"}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(()=>screen.getAllByText("Mes notes de frais"))
      const ticketName = await screen.getByText("encore")
      expect(ticketName).toBeTruthy()
    })
    describe("When an error occurs on API", ()=>{
    beforeEach(()=>{
      jest.spyOn(mockStore,"bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("then it should fetch bills from an API and fails with a 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
      // TOUN, NICOLAS= est-ce que je recopie le test de dedashboard? j'aurai envi de tester ce que fait le catch : soit console log l'error mais je ne sais pas comment m'y prendre
      // TOUN: Tester le console log?
      // test("then it should fetch bolls from an API and console log a date format error", async () => {
      //   mockStore.bills.mockImplementationOnce(() => {
      //     return {
      //       then(snapshot => {
      //         const bills=snapshot
      //           .map(doc => {
      //             try{
      //               return Promise.reject(new Error("corrupted data"))
      //             } catch(e){
      //               const logSpy = jest.spyOn(console, 'log');
      //               console.log('error data');
      //               expect(logSpy).toHaveBeenCalledWith('error data');

      //             }

      //           })
      //         })
      //     }})
  
      //   window.onNavigate(ROUTES_PATH.Bills)
      //   await new Promise(process.nextTick);
      //   const message = await screen.getByText(/corrupted data/)
      //   expect(message).toBeTruthy()

      // })
    })
  })
})
