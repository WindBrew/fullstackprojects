import React, { Component } from 'react';
import {useNavigate}  from 'react-router-dom';
 function withNavigation(Component){
  
    return function(props){
         const navigate = useNavigate()
        return <Component {...props} navigate={navigate} />
    }
 }
class Plans extends Component {
    windowToTop = () =>{
        window.scrollTo({top: 0}) 
   
    }
    state = {
        plan: "",
        
    }
    checkUser = async () => {
        const response = await fetch("http://localhost:5001/Plans/user",{
            method:"GET",//error caused is when the user has a pre existing plan they cannot select a new one it auto navs them ]
            //back to news page
            headers:{
                "authorization" : localStorage.getItem("token")
            }
        })
        const data = await response.json()
        if(!(response.ok)){
            this.props.navigate("/")
            localStorage.clear("token")
        }
        else{
            // if(data.plan){
            //     this.props.navigate("/NewsPage")
            //     this.props.loader(true)
            //     return;
            // }
            console.log("Select a plan user")
            console.log("plan get response : ",data)
        }
    }
   setPlan = async (plan) => {const response = await fetch("http://localhost:5001/Plans/user",{
    

    method: "PATCH",
    headers:{
        "authorization" : localStorage.getItem("token"),
        "Content-Type" : "application/json"
    },
    body: JSON.stringify({
        "plans" : plan,
       
    })

   });
   
   if(response.ok){
    console.log("response is okay")
   const data = await response.json()
    if(data.plan && data.plan !== null){
        this.props.navigate("/NewsPage")
        this.setState({firstLoad: false})
        localStorage.setItem("preventRerun",true)
    }
    else{
        console.log(data)
        console.log("Please select a plan")
    }
   }
   else{
    console.log("response is not okay yet navigate is not running",response.status)
    this.props.navigate("/")
   }
}
  
    componentDidMount(){
        
        this.checkUser()
        //fix this else whenever the page reloads the userplan is gone
        //you need to fix this part where page reload sends plan as null make this run only on 
        // first load of page that too if plans are not set already
        //maybe an if condition
        //also ensure if plans are none expiry is not read
     
        this.windowToTop()
        this.props.loader(true)
        console.log("called loader in plans")



        setTimeout(()=>{this.props.loader(false)},350)
        
      console.log("plans mounted")
    }
  render() {
    return (

      <div className="w-full">
       <button  onClick={this.props.logout} className="ml-4 fixed flex right-[1%] py-2 my-2 px-2 rounded-xl font-medium select-none border-none text-gray-900 dark:text-white bg-slate-300 dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white">
            Log out
          </button>
    <div className="py-20 max-w-5xl min-h-screen mx-auto px-4 ">{/* If you add dark:color to an element
     and parent seperately they will transition at different times might look meh */}
    <h1 className="text-center text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Pricing</h1>
    <p className="text-center text-gray-400 md:text-lg mt-2">Use it for free for yourself, upgrade when your team needs
        advanced control.</p>
    <div className=" grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 mt-10">
    
        <div className="rounded-3xl  border border-gray-400  p-[3px]  hover: cursor-pointer " onClick={()=>{this.setState({plan: "Base"}); this.setPlan("Base")}}>
            <div className="flex  flex-col items-center border rounded-3xl border-gray-400 p-4">
                <span className="mb-6 text-gray-800">Base</span>
                <span className="mb-3 text-4xl font-medium">Base
                    </span>
                <span className="text-gray-500">Best for 30 sec read</span>
            </div> 
             </div>
            {/* <div className="space-y-4 py-9">
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">One workspace</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Basic analytics</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Team collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Unlimited file storage	</span>
                </div>
            </div> */}
       

    
        <div className="rounded-3xl border border-gray-400  p-[3px] hover:cursor-pointer" onClick={()=>{this.setState({plan: "Pro"}); this.setPlan("Pro")}}>
            <div className="flex flex-col items-center border rounded-3xl border-gray-400 p-4">
                <span className="mb-6 text-gray-800">Pro</span>
                <span className="mb-3 text-4xl font-medium">Pro</span>
                <span className="text-gray-500">Best for 1 min read</span>
            </div>
            {/* <div className="space-y-4 py-9">
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">One workspace</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Basic analytics</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Team collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-gray-400 text-sm text-gray-400">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Unlimited file storage	</span>
                </div>
            </div> */}
        </div>

       
        <div className="rounded-3xl border border-gray-400  p-[3px] hover:cursor-pointer" onClick={()=>{this.setState({plan: "Premium"}); this.setPlan("Premium")}}>
            <div className="flex flex-col items-center border rounded-3xl  border-gray-400 p-4">
                <span className="mb-6 text-gray-800">Premium</span>
                <span className="mb-3 text-4xl font-medium">Premium</span>
                <span className="text-gray-500">Best for 2 min read</span>
            </div>
            {/* <div className="space-y-4 py-9">
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">One workspace</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Basic analytics</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Team collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="grid size-5 place-content-center rounded-full bg-indigo-500 text-sm text-white">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"
                            xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span className="text-sm text-gray-400">Unlimited file storage	</span>
                </div>
            </div> */}
        </div>
    </div>
</div>

</div>

    )
  }
}
export default withNavigation(Plans);