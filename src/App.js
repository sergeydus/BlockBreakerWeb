import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client'
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Growl} from 'primereact/growl';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ContextMenu} from 'primereact/contextmenu';
import {roundRect,weed} from './functions'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import firebase from 'firebase';
import Loginform from './components/loginform.js';
import Playerstats from './components/playerstats.js';
import MatchModal from './components/MatchModal.js';
import loadgif from './images/loading2.gif';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '',
                  endpoint:'"http://192.168.1.20:3004',
                  socket:socketIOClient('http://192.168.1.20:3004',{forceNew:true}),//http://77.138.108.122:3004
                  result:'',
                  mode:0,   //0 = login, 1 = menu, 2 = game.,
                  users:[], //online users
                  me:null,
                  selectedUser:{username:''},
                  lobbychat:[], //lobby text
                  clientext:'', //text in the textbox users can write in
                  width:600,    //canvas width
                  height:600,   //canvas height
                  provider:new firebase.auth.FacebookAuthProvider(),
                  statsmodal:false, //set to true if looking at opponents stats
                  inqueue:false,    // if searching for a match
                };
    console.log('http://77.138.108.122:3004');
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sleep=this.sleep.bind(this);
    this.facebooksignin=this.facebooksignin.bind(this);
    this.facebookSignout=this.facebookSignout.bind(this);

  
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Normal signin, email and password.
  Signin(email,password){
    console.log('sign in:',email,password);
    firebase.auth().signInWithEmailAndPassword(email, password).then(async (e)=>{
      console.log('success?');
      console.log(e); 
      console.log('my uid is:'+e.user.uid);
      await this.setState({value:e.user.uid});
      console.log("this.state.socket.emit('change username', this.state.value);");
      this.state.socket.emit('change username', this.state.value);
    }).catch((error)=> {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      this.growl.show({severity: 'error', summary: 'Error Message', detail:errorMessage});
      // ...
    });
  }
  //signout from everything, not just facebook.
  facebookSignout() {
    firebase.auth().signOut()
    .then(()=> {
       console.log('Signout successful!')
       this.state.socket.emit('logout', null);
       this.setState({mode:0});
    }, function(error) {
       console.log('Signout failed')
    });
 }
 //signin with facebook
  facebooksignin(){
    firebase.auth().signInWithPopup(this.state.provider).then(async (result)=>{
      var token = result.credential.accessToken;
      var user = result.user;
      this.setState({value:user.uid});
      this.state.socket.emit('facebooklogin', {email:user.email,uid:user.uid});
      console.log('afer rogin');
      // this.setState({mode:1});

   }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
      this.growl.show({severity: 'error', summary: 'Error Message', detail:error.message});
   });
  };
  //signup with email and password and login right after.
  async signup(email,password){
    console.log("email:",email,"password:",password);
    return await firebase.auth().createUserWithEmailAndPassword(email, password).then((e)=>{
      let data = {email:email,password:password,uid:e.user.uid}
      this.state.socket.emit('NewLogin', data);
      return true;
    }).catch((error)=> {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error.code);
      console.log(error.message);
      this.growl.show({severity: 'error', summary: 'Error Message', detail:errorMessage});
      return false;
      // ...
    });
  }
  componentDidMount(){
    var config = {
      apiKey: "AIzaSyCAJXsbjKSJO0j4YysCsCQlACCmFiwMBnY",
      authDomain: "block-breaker-project.firebaseapp.com",
      databaseURL: "https://block-breaker-project.firebaseio.com",
      projectId: "block-breaker-project",
      storageBucket: "block-breaker-project.appspot.com",
      messagingSenderId: "282731540362"
    };
    firebase.initializeApp(config);
    var db = firebase.database();
    var ref = db.ref("/users");
    //once = get data once, on = get every time change occures
    //The value event is called every time data is changed at the specified database reference
    ref.on("value", function(snapshot) {
      console.log('firebase');
      // console.log(snapshot.val());
    });
      this.state.socket.on('change username', (mybool) => {
      console.log(mybool);
      if(mybool!=='ok'){
        if(mybool=='Please select a nickname'||mybool=='Please select a different nickname'){
          var nickname = "";
          while(nickname==""){
            nickname = prompt(mybool);
          }
          this.state.socket.emit('Nickname', {nickname:nickname,uid:this.state.value});
        }
        else this.growl.show({severity: 'error', summary: 'Error Message', detail:mybool});
      }
      else{
        this.growl.show({severity: 'success', summary: 'Success Message', detail: 'Welcome '+this.state.value});
        this.setState({mode:1});

      }
    });
    //recieving messages
    this.state.socket.on('servermessage',(data)=>{this.growl.show({severity: 'error', summary: 'Error Message', detail:data})});
    this.state.socket.on('chatmessage', (data) => {
      if(this.state.mode===1){
        let newchat = this.state.lobbychat;
        if(this.state.lobbychat.length===0){
          newchat.push({username:data.nickname,message:data.message,color:false});
        }
        else if(this.state.lobbychat[this.state.lobbychat.length-1].color===false){
          newchat.push({username:data.nickname,message:data.message,color:true});
        }
        else{newchat.push({username:data.nickname,message:data.message,color:false});}
        this.setState({lobbychat:newchat});  
        this.scrolltobot.scrollTop = this.scrolltobot.scrollHeight;//scrolls down when recieves new message
      }
    });

    //all the avaiable users
    this.state.socket.on('users', (data) => {
      let NewUserArray=[];
      for (let index = 0; index < data.users.length; index++) {
        NewUserArray.push(data.users[index]);
        
      }
      console.log('users:',data);
      this.setState({me:data.me});
      console.log(data);
      this.setState({users:NewUserArray});
    });

    //someone requests to play with you, data is their id
    this.state.socket.on('requestgame', (data) => {
      console.log("received game request");
      console.log(data);
      confirmAlert({
        title: 'Confirm to submit',
        message: data+' has requested to play with you, Accept?',
        buttons: [
          {
            label: 'Yes',
            onClick: () =>{
              this.state.socket.emit('acceptgame', {opponent:data,HasAccepted:true}); 
              console.log("Emitting for acceptgame:");
              console.log({opponent:data,HasAccepted:true});
              this.setState({mode:2});
            }
          },
          {
            label: 'No',
            onClick: () =>{
              this.state.socket.emit('acceptgame', {opponent:data,HasAccepted:false});
              console.log("Emitting for acceptgame:");
              console.log({opponent:data,HasAccepted:false});
            }
          }
        ]
      });
    });

    this.state.socket.on('acceptgame', (data) => {
      if(data.HasAccepted===true){
        console.log("opponent accepted", data.HasAccepted);
        console.log(data);
        this.setState({mode:2,inqueue:false});

      }else {
        this.growl.show({severity: 'error', summary: 'Success Message', detail: 'opponent declined.'});
      }
        
    });
    this.state.socket.on('startgame', (data) => {
      
      let ctx = this.canvas.getContext('2d');
      ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      ctx.fillText('p',325,325);
    });
    //recieved update on the current game
    this.state.socket.on('gameupdate', async (data) => {
      let ctx = this.canvas.getContext('2d');
      if(!data.isover){
        ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        if(data.isplayer1){
          //display score
          ctx.font="24px Comic Sans MS";
          let text="Score:"+data.board.player1score.toString();
          ctx.fillStyle='orange'
          ctx.textBaseline = "bottom";
          ctx.fillText(text,text.length*6,this.canvas.height);
          ctx.textBaseline = "top";
          text="opponent's Score:"+data.board.player2score.toString();
          ctx.fillText(text,this.canvas.width-text.length*6,0);

          ctx.fillStyle='#abc';
          roundRect(ctx,data.board.player1.posx,data.board.player1.posy,data.board.player1.width,data.board.player1.height,5,true,true);
          roundRect(ctx,data.board.player2.posx,data.board.player2.posy,data.board.player2.width,data.board.player2.height,5,true,true);
          
          //ball color red 
          
          ctx.fillStyle="#000000";//black ball
          for(let i =0; i < data.board.balls.length;i++){
            roundRect(ctx,data.board.balls[i].posx,data.board.balls[i].posy,data.board.balls[i].width,data.board.balls[i].height,3,true,true);
          }
          ctx.fillStyle="purple";
          for (let index = 0; index < data.board.blocks.length; index++) {
            // console.log('currently at index number',index);
            if(data.board.blocks[index].score===10)
              ctx.fillStyle="gray";
            else if(data.board.blocks[index].score===20)
                ctx.fillStyle="green";
            else if(data.board.blocks[index].score===30)
              ctx.fillStyle="orange";
            else if(data.board.blocks[index].score===40){
                let gradx= data.board.blocks[index].posx;
                let grady= data.board.blocks[index].posy;
                let gradendx =data.board.blocks[index].posx+data.board.blocks[index].width;
                let gradendy = data.board.blocks[index].posy + data.board.blocks[index].height;
                let my_gradient = ctx.createLinearGradient(gradx,grady,gradendx,gradendy);
                my_gradient.addColorStop(0, "#FFFFFF");
                my_gradient.addColorStop(0.08, "#FFFFAC");
                my_gradient.addColorStop(0.25, "#D1B464");
                my_gradient.addColorStop(0.625, "#C49700");
                my_gradient.addColorStop(0.75, "#9f7928");
                my_gradient.addColorStop(1, "#FEDB37");
                ctx.fillStyle=my_gradient;
              }
            roundRect(ctx,data.board.blocks[index].posx,data.board.blocks[index].posy,data.board.blocks[index].width,data.board.blocks[index].height,4,true,true);
          }
        }
        else{
          //display score
          ctx.font="24px Comic Sans MS";
          let text="Score:"+data.board.player2score.toString();
          ctx.fillStyle='orange'
          ctx.textBaseline = "bottom";
          ctx.fillText(text,text.length*6,this.canvas.height);
          ctx.textBaseline = "top";
          text="opponent's Score:"+data.board.player1score.toString();
          ctx.fillText(text,this.canvas.width-text.length*6,0);
          ctx.fillStyle='#abc';
          roundRect(ctx,data.board.player2.posx,data.board.player1.posy,data.board.player1.width,data.board.player1.height,5,true,true);
          roundRect(ctx,data.board.player1.posx,data.board.player2.posy,data.board.player1.width,data.board.player1.height,5,true,true);
          
          //ballcolor
          ctx.fillStyle="#000000";//black ball
          for(let i =0; i < data.board.balls.length;i++){
            roundRect(ctx,data.board.balls[i].posx,this.canvas.height-data.board.balls[i].posy-data.board.balls[i].height,data.board.balls[i].width,data.board.balls[i].height,3,true,true);
          }
          
          for (let index = 0; index < data.board.blocks.length; index++) {
            if(data.board.blocks[index].score===10)
              ctx.fillStyle="gray";
            else if(data.board.blocks[index].score===20)
                ctx.fillStyle="green";
            else if(data.board.blocks[index].score===30)
              ctx.fillStyle="orange";
            else if(data.board.blocks[index].score===40){
              let gradx= data.board.blocks[index].posx;
              let grady= this.canvas.height-data.board.blocks[index].posy-data.board.blocks[index].height;
              let gradendx =data.board.blocks[index].posx+data.board.blocks[index].width;
              let gradendy = grady + data.board.blocks[index].height;
              let my_gradient = ctx.createLinearGradient(gradx,grady,gradendx,gradendy);

              my_gradient.addColorStop(0, "#FFFFFF");
              my_gradient.addColorStop(0.08, "#FFFFAC");
              my_gradient.addColorStop(0.25, "#D1B464");
              my_gradient.addColorStop(0.625, "#C49700");
              my_gradient.addColorStop(0.75, "#9f7928");
              my_gradient.addColorStop(1, "#FEDB37");
              ctx.fillStyle=my_gradient;
              }
            roundRect(ctx,data.board.blocks[index].posx,this.canvas.height-data.board.blocks[index].posy-data.board.blocks[index].height,data.board.blocks[index].width,data.board.blocks[index].height,4,true,true);
          }
        }
        if(data.message>0){
          ctx.textAlign='center';
          if(data.message==3){ctx.fillStyle='red'}
          if(data.message==2){ctx.fillStyle='yellow'}
          if(data.message==1){ctx.fillStyle='green'}
          ctx.font="50px Comic Sans MS";
          ctx.fillText(data.message.toString(), this.canvas.width/2, this.canvas.height/2); 
        }
      }
      else{
          if(data.HasWon){
            weed();
            console.log("Victory");
            var img = new Image();
            img.src = '/images/WINNER.jpg';
            img.onload = ()=>{
              ctx.drawImage(img, this.canvas.width/2, this.canvas.height/2);
              // alert('the image is drawn');
            }
            await this.sleep(2000);
            this.setState({mode:1});
          }
          else {
            weed();
            var img = new Image();
            img.src = '/images/LOSER.jpg';
            img.onload = ()=>{
              ctx.drawImage(img, this.canvas.width/2, this.canvas.height/2);
              // alert('the image is drawn');
            }
            console.log('failure');
            await this.sleep(2000);
            this.setState({mode:1});
          }
      }
        console.log(data);
      });
    }
    
    handleSubmit(event) {
    this.state.socket.emit('change username', this.state.value);
    event.preventDefault();
  }
  send = () => {
    const socket = socketIOClient(this.state.endpoint)
    
    // this emits an event to the socket (your server) with an argument of 'red'
    // you can make the argument any username you would like, or any kind of data you want to send.
    
    socket.emit('username', this.state.value); 
  }
  onMouseMove=(e)=>{
    var x = e.pageX-this.canvas.offsetLeft;
    this.state.socket.emit('gamemousemove', {x:x});
  }
  Startqueue=()=>{
    this.setState({inqueue:true});
    this.state.socket.emit('quickmatch',null);
  }
  endqueue=()=>{
    this.setState({inqueue:false});
    this.state.socket.emit('stopqueue',null);
  }
  
  getrender(){
    let items = [
      {label: 'Message', icon: 'pi pi-fw pi-search'},
      {label: 'Challange', icon: 'pi pi-fw pi-times',command: (event) => this.state.socket.emit('requestgame', this.state.selectedUser.username)},
      {label: 'details', icon: 'pi pi-fw pi-times',command: async (event) => {
        await this.setState({statsmodal:true});
      }}
    ];

    if(this.state.mode==0){
      return (
        <div className="App" style={{display: 'flex', justifyContent: 'center'}}  >
      <ContextMenu model={items} ref={el => this.cm = el}></ContextMenu>
      <Growl position='topleft' ref={(el) => this.growl = el} />
      <Loginform facebooklogin={this.facebooksignin} login={this.Signin.bind(this)} signup={this.signup.bind(this)}/>
    </div>
      );
    }
    else if(this.state.mode==1){
      return(
        <div className="p-g lobby">
            <ContextMenu model={items} ref={el => this.cm = el}></ContextMenu>
            {(this.state.statsmodal)?(<Playerstats player={this.state.users.find(user=>user.username===this.state.selectedUser.username)} ishidden={this.state.statsmodal} hidefunc={(e)=>this.setState({statsmodal:false})}/>):null}
          <Growl position='topleft' ref={(el) => this.growl = el} />
          <div className="p-g-8 lobbychild1"  >
            <ul ref={(el) => this.scrolltobot = el} style={{margin:0,resize:'none',height:'80vh',width:'100%',backgroundColor:'white',overflow:'auto',border:'solid'}} >
              {this.state.lobbychat.map((d,idx)=>{
                console.log("makin li for :",d.message);
                return (<li key={idx} style={{backgroundColor:(d.color)?'#80AAB8':'#00FFE7',listStyleType:'none'}}>{d.username+': '+d.message}</li>)
              })}
            </ul>
          </div>
          <div className="p-g-2 lobbychild2" contextMenu={this.cm}  >
            <div className="profile">
              <h3 style={{marginTop:0}}>welcome {(this.state.me!=null)?(this.state.me.nickname):("Loading...")}</h3>
              <div>Wins:{(this.state.me!=null)?(this.state.me.details.wins):("Loading...")}</div>
              <div>Losses:{(this.state.me!=null)?(this.state.me.details.losses  ):("Loading...")}</div>
            </div>
            <DataTable value={this.state.users} contextMenu={this.cm} selectionMode="single" header="Right Click"
                        selection={this.state.selectedUser} onSelectionChange={(e) => this.setState({selectedUser: e.data})} draggable="false">
                    <Column field="nickname" header="Online players" footer={<Button  label="Logout" className="p-button-warning" onClick={this.facebookSignout} style={{width:"100%",height:"100%",margin:0,padding:0}}/>} />
            </DataTable> 
            <MatchModal vs_player_func={(e)=>{this.state.socket.emit('quickmatch',null)}} vs_ai_func={(e)=>{this.state.socket.emit('matchvsai',null)}}
              startqueuefunc={()=>this.Startqueue()} stopqueuefunc={()=>this.endqueue()} inqueue={this.state.inqueue}/>

            {(this.state.inqueue)?(<img src={loadgif} />):(null)}
          </div>
          <div className="p-g-8 lobbychild1">
            <hr></hr>
            <textarea 
              resize={"false"} 
              value={this.state.clientext} 
              style={{background:'rgb(194, 194, 194)',height:'4em',width:'100%',borderRadius:'7px'}} 
              placeholder='say hello!'
              onChange={(e)=>this.setState({clientext:e.target.value})} 
              onKeyUp=
              {(e)=>{
                if(e.keyCode===13){
                  this.state.socket.emit('chatmessage', this.state.clientext);
                  this.setState({clientext:''});
                }
              }}
            />
          </div>
        </div>
      );
    }
    else if(this.state.mode==2){
      return(
      <div>
        <ContextMenu model={items} ref={el => this.cm = el}></ContextMenu>
        <Growl position='topleft' ref={(el) => this.growl = el} />
        <div className='gamecss'>
          <canvas ref={(el) => this.canvas = el} width={this.state.width} height={this.state.height} style={{borderStyle:'solid'}} onMouseMove={this.onMouseMove}/>
        </div>
      </div>
      );
    }
  }
  render() {
    return (
      this.getrender()
    );
  }
}

export default App;
