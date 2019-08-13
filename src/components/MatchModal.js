import React, { Component } from 'react';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Button} from "primereact/button";
import {Dialog} from 'primereact/dialog';

export default class MatchModal extends React.Component {
    constructor(props, context) {
        super(props, context);
    
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    
        this.state = {
          show: false
        };
      }
    
      handleClose() {
        this.setState({ show: false });
      }
    
      handleShow() {
        if(this.props.inqueue){
            this.props.stopqueuefunc();
        }
        else{
            this.setState({ show: true });
            console.log("showing");
        }
      }
   
    render(){
      
        return (
            <div className="static-modal">
                {((this.state.show)?(<div className="BehindModal" onClick={this.handleClose}/>):(null))}
                <Button label={(this.props.inqueue)?"Cancel Search":"Find Match"} className="p-button-raised p-button-rounded MatchButton" onClick={this.handleShow} />
                <Dialog header={<div style={{background:"cyan",margin:0,padding:0}}>Wawazers!</div>} visible={this.state.show} width="350px"  onHide={this.handleClose} resizable={false}>
                    <div className="p-grid MatchWindow">
                        <div className="p-col"><span>Choose a mode</span></div>
                        <div className="p-col">
                            <Button label="Online Duel" style={{margin:"1em",fontSize:"150%"}} onClick={()=>{this.props.startqueuefunc();this.handleClose();}}/>
                        </div>
                        <div className="p-col">
                            <Button label="Single-Player" style={{margin:"1em",fontSize:"150%"}} onClick={this.props.vs_ai_func}/>
                        </div>
                        {/* <Button onClick={e=>console.log(this.props.player)}/> */}
                    </div>
                </Dialog>     
            </div>
          );
    }
}