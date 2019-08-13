import React, { Component } from 'react';
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Dialog} from 'primereact/dialog';
// import {Password} from 'primereact/password';
import { FacebookLoginButton } from "react-social-login-buttons";

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
export default class Playerstats extends React.Component {
    constructor(props) {
        super();
        this.state={
            player:'',
            signup:true,//modal visibility
        }
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        console.log(this.props.ishidden);
    }
    componentWillMount(props){
        console.log('recivs');
        console.log(this.props.player);
        this.setState({player:this.props.player});
        
        // this.setState()
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps!==this.props){

            console.log('prevrops  are;');
            console.log(prevProps);
            console.log('new ones are:');
            console.log(this.props)
            this.setState({player:this.props.player});
        }
    }
    render(){
      
        return (
            <div className="TOOTYFROOTY">
                <Dialog visible={this.state.signup} width="350px"  onHide={(e) => this.props.hidefunc()} resizable={false}>
                    <div className="p-grid">
                        <div className="p-col">
                            {/* <p>{(this.props.ishidden)?'got true':'got flase'}</p> */}
                            <p>wins:{this.state.player.details.wins}</p>
                            <p>losses:{this.state.player.details.losses}</p>
                        </div>
                        {/* <Button onClick={e=>console.log(this.props.player)}/> */}
                    </div>
                </Dialog>     
        </div>
        );
    }
}