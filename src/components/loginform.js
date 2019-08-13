import React, { Component } from 'react';
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
// import {Password} from 'primereact/password';
import { FacebookLoginButton } from "react-social-login-buttons";
import {Dialog} from 'primereact/dialog';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
export default class Loginform extends React.Component {
    constructor(props) {
        super();
        this.state={
            username:'',
            password:'',
            signupusername:'',
            signuppassword:'',
            signup:false,//modal visibility
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
    handleClose() {
        this.setState({ signup: false });
    }
    handleChange(event) {
        this.setState({username: event.target.value});
    }
    handlePassChange(event) {
        this.setState({password: event.target.value});
    }
    handleSubmit(event) {
        console.log(this.state);
        event.preventDefault();
      }

    render(){
        // let bob = {a:1,b:2,c:3};
        // console.log('ze bob:'+bob['a']);
        return (
            // <form className="LoginForm" onSubmit={this.handleSubmit}>
            <div className="LoginForm">
                {/* <label style={{display:'flex',justifyContent:'flex-start', margin:'1ch'}}>Login</label> */}
                {((this.state.signup)?(<div className="BehindModal" onClick={this.handleClose}/>):(null))}
                <Dialog visible={this.state.signup} width="350px" onHide={(e) => this.setState({signup: false})}>
                    <div className="p-grid">
                        <div className="p-col"  >
                            <h2 style={{textAlign:'center',marginTop:0}}>signup</h2>
                        </div>
                        <div className="p-col">
                            {/* <input type="text" placeholder='username' value={this.state.username} onChange={this.handleChange} /> */}
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"/>
                                </span>
                                <InputText placeholder="Email" style={{width:'100%'}} onChange={(e) => this.setState({signupusername: e.target.value})} />
                            </div>
                        </div>
                        <div className="p-col">
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-lock"/>
                                </span>
                                <InputText type='password' style={{width:'100%'}} placeholder="Password" onChange={(e) => this.setState({signuppassword: e.target.value})}
                                onKeyUp=
                                {(e)=>{
                                  if(e.keyCode===13){
                                    
                                  }
                                }} />
                            </div>
                        </div>
                        <div className="p-col">
                            <Button label="Signup!" style={{width:'100%',marginTop:'1ch'}} onClick={async (e)=>{
                                let x = await (this.props.signup(this.state.signupusername,this.state.signuppassword));
                                // console.log((this.props.signup(this.state.signupusername,this.state.signuppassword)));
                                console.log(x);
                                if(x){
                                    this.setState({signup:false});
                                }
                            }} />
                        </div>
                    </div>
                </Dialog>

                <div className="p-grid">
                    <div className="p-col"  >
                        <h2 style={{textAlign:'left',marginTop:0}}>Login</h2>
                    </div>
                    <div className="p-col">
                        {/* <input type="text" placeholder='username' value={this.state.username} onChange={this.handleChange} /> */}
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-user"/>
                            </span>
                            <InputText placeholder="Email" style={{width:'100%'}} onChange={(e) => this.setState({username: e.target.value})} 
                            onKeyUp=
                            {(e)=>{
                              if(e.keyCode===13){
                                this.props.login(this.state.username,this.state.password);
                              }
                            }} />
                        </div>
                    </div>
                    <div className="p-col">
                        {/* <input type="text" placeholder='username' value={this.state.username} onChange={this.handleChange} /> */}
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-lock"/>
                            </span>
                            <InputText type='password' style={{width:'100%'}} placeholder="Password" onChange={(e) => this.setState({password: e.target.value})}
                             onKeyUp=
                             {(e)=>{
                               if(e.keyCode===13){
                                 this.props.login(this.state.username,this.state.password);
                               }
                             }} />
                        </div>
                    </div>
                    <div className="p-col">
                        <Button label="Login" style={{width:'100%',marginTop:'1ch'}} onClick={(e)=>this.props.login(this.state.username,this.state.password)} />
                    </div>
                    <div className="p-col">
                        <small>Don't have an account? <i style={{color:'blue',backgroundColor:'orange',cursor:'pointer'}} onClick={(e) => this.setState({signup: true})}>Sign up</i></small>
                    </div>
                </div>
                <hr/>
                <FacebookLoginButton onClick={(e)=>this.props.facebooklogin()}/>


            {/* </form> */}
        </div>
        );
    }
}