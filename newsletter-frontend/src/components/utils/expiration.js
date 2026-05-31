// export const expirationTimer = (comp,saveData,counter,subUpdtr,categoryPass) =>{
         
//           clearInterval(comp.timecount)
//           counter(comp.user.expiry,comp)
          
       
//          comp.timeout = setTimeout(()=>{
//             console.log("TIMEOUT INITIATED")
//             console.log(comp.state.subscriber[comp.state.email].expiry)
//            subUpdtr(comp,"none",0,saveData)
                
//             console.log("TO LOGOUT IN 4 SECONDS")
//            comp.logouttime =  setTimeout(()=>{
          
              
//               comp.checkUser()
//               comp.setState({counter: 0,togglePlanNews: "Plans"})
//               clearInterval(comp.timecount)
//               categoryPass("all","Active")
             
//             },4000)
//           }, comp.state.subscriber[comp.state.email].expiry)
       
//         }
//from here on writing the new logic for the full stack expiry\
// fetch expiry from database and compare it to date.now if date.now is greater mark expired and no timer and check it in between intervals
//of 3-5 seconds else you can also set the counter for the speciifc timer and set it to false when it runs out ,
//write logic to add to the database timer when a new plan is subscribed to instead or overwriting the old one with a new one add 
//and combine both days 
//or is it better to just subtract current time from new adding time and add it ?
//depends on the app type 