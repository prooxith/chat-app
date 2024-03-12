const socket = io('http://192.168.0.109:8000');
// const mongoose = require('mongoose')

let selfname;
let profileImg;
if(localStorage.getItem("name") && localStorage.getItem("profile")){
	selfname = localStorage.getItem("name")	
	const nameInfo = document.querySelector('.right-header-info-name')
	nameInfo.innerText = selfname

	const imageCon = document.querySelector('.profile-img')
	const imgname = localStorage.getItem("profile")
	profileImg = imgname
	imageCon.src = `/uploads/${imgname}`
}
else{
	console.log('log in bro')
	const loginForm = document.querySelector('.login-container').style.visibility = 'visible'
}

socket.emit('new-user-joined', {name: selfname, profile: profileImg});


const form = document.getElementById('send-container');
const messageInp = document.getElementById('messageInp');
const messageContainer = document.querySelector('.messages-container');
const messageTop = document.querySelector(".message-top")
const messageBelow = document.querySelector(".message-below")
const imageContainer = document.querySelector('.image-row');
const onlineList = document.querySelector('.online-members-all')
const offlineList = document.querySelector('.offline-members-all')
let typing2 = document.querySelector(".peri-info")
let typing1 = document.querySelector(".under-peri")
typing1.style.display = "none"
let input_typing = {
	messageInp: messageInp,
	typing1: typing1
}
var audio = new Audio('ting.mp3');

const append = (profile, name, message)=>{
	const messageElement = document.createElement('div');
	const messageProfile = document.createElement('div')
	messageProfile.classList.add("message-profile")
	const imgTag = document.createElement('img')
	imgTag.classList.add('msg-profile-img')
	imgTag.src = `./uploads/${profile}`
	imgTag.setAttribute("onclick", "showImg(this)")
	messageProfile.append(imgTag)
	messageElement.append(messageProfile)
	const messageInfo = document.createElement('div')
	messageInfo.classList.add("message-info")
	messageElement.append(messageInfo)
	const messageTop = document.createElement('div')
	messageTop.classList.add("message-top")
	messageTop.innerText = name
	const messageBelow = document.createElement('div')
	messageBelow.classList.add("message-below")
	messageBelow.innerHTML = message
	messageInfo.append(messageTop)
	messageInfo.append(messageBelow)
	messageElement.classList.add('message');
	messageContainer.append(messageElement);
	updateScroll();
}

socket.on("msg-list", user=>{
	append(user["profile"], user["user"], user["message"])
})

socket.on("allUsers", users=>{
	if(users["name"] == selfname) return
	OffineMemberJoin(users["name"], users["profile"])
})

socket.on("onlineUser", users=>{
	name = users["name"]
	if (name==selfname) return
	if(name.includes(" ")){
		let newname = name.replaceAll(" ", "-")
		const isOffline = document.querySelector(`.${newname}`)
		if(isOffline) isOffline.remove()
		OnlineMemberJoin(users["name"], users["profile"])

	}else{
		const isOffline = document.querySelector(`.${name}`)
		if(isOffline) isOffline.remove()
		OnlineMemberJoin(users["name"], users["profile"])

	}
})

const appendImages = (source, position) =>{
	const imgElement = document.createElement('img');
	imgElement.classList.add('image');
	imgElement.classList.add(position);
	imgElement.src = source;
	imageContainer.append(imgElement)
}

const OnlineMemberJoin = (name, profile) =>{
	const member = document.createElement('div');
	member.classList.add('member');
	if(name.includes(" ")){
		let newname = name.replaceAll(" ", "-")
		member.classList.add('online-member');
		member.classList.add(newname);
		member.innerHTML = `
			<div class="member-profile member-profile-online">
				<img src="./uploads/${profile}" class="member-img" onclick="showImg(this)">
			</div>
			<div class="member-name">
				${name}
			</div>
		`
		console.log(newname)
	}
	else{
		member.classList.add(name);
		member.innerHTML = `
			<div class="member-profile member-profile-online">
				<img src="./uploads/${profile}" class="member-img" onclick="showImg(this)">
			</div>
			<div class="member-name">
				${name}
			</div>
		`
	}
	onlineList.append(member);
}

const OffineMemberJoin = (name, profile) =>{
	const member = document.createElement('div');
	member.classList.add('member');
	member.classList.add('offline-member');
	if(name.includes(" ")){
		let newname = name.replaceAll(" ", "-")
		member.classList.add(newname);
		member.innerHTML = `
			<div class="member-profile member-profile-offline">
				<img src="./uploads/${profile}" class="member-img" onclick="showImg(this)">
			</div>
			<div class="member-name">
				${name}
			</div>
		`
	}
	else{
		member.classList.add(name);
		member.innerHTML = `
			<div class="member-profile member-profile-offline">
				<img src="./uploads/${profile}" class="member-img">
			</div>
			<div class="member-name">
				${name}
			</div>
		`
	}
	offlineList.append(member);
}



let someonetyping = false

const typing = (value)=>{
	if(!value == ""){
		someonetyping = true
		typing_ess = {
			someonetyping: someonetyping,
			name: selfname
		}
		socket.emit("someone-typing", typing_ess)
	}
	else if(value == ""){
		someonetyping = false
		typing_ess = {
			someonetyping: someonetyping,
			name : selfname
		}
		socket.emit("someone-typing", typing_ess)
	}
}

socket.on('user-joined', info =>{
	let name =  info["name"]
	if(name.includes(" ")){
		let newname = name.replaceAll(" ", "-")
		const isOffline = document.querySelector(`.${newname}`)
		if(isOffline) isOffline.remove()
		OnlineMemberJoin(info["name"], info["profile"])
		noOneActive()
		append('batmanbot.png', 'BotBatman', `${name} just entered the chat x)`)
	}else{
		const isOffline = document.querySelector(`.${name}`)
		if(isOffline) isOffline.remove()
		OnlineMemberJoin(info["name"], info["profile"])
		noOneActive()
		append('cocc.jpg', 'BotBatman', `${name} just entered the chat x)`)
	}
	
})


socket.on('receive', data =>{
	append(data.img, data.name, data.message)
})

socket.on('typing-true', data=>{
	console.log("reached")
	if(data["someonetyping"]){
		typing2.innerHTML = `${data["name"]} is typing......`
		typing1.style.display = "grid"
	}
	else{
		typing1.style.display = "none"
	}
})

socket.on('left', name =>{
	append('batmanbot.png', 'BotBatman', `${name} just left the chat:/`)
	if(name.includes(" ")){
		let newname = name.replaceAll(" ", "-")
		const img = document.querySelector(`.${newname}`).childNodes[1].childNodes[1].src
		const imgName = img.replace(/^.*[\\\/]/, '');
		let memberClass2 = document.querySelector(`.${newname}`)
		memberClass2.remove();
		noOneActive()
		OffineMemberJoin(name, imgName)
	}
	else{
		const memberClass = document.querySelector(`.${name}`)
		const img = document.querySelector(`.${name}`).childNodes[1].childNodes[1].src
		const imgName = img.replace(/^.*[\\\/]/, '');
		memberClass.remove()
		noOneActive()
		OffineMemberJoin(name, imgName)
	}
})

const noOneActive=()=>{
	const isOnlineAny = document.querySelector('.member-profile-online')
	if(isOnlineAny){
		const noOnline = document.querySelector('.noOnline')
		if(!noOnline) return
		noOnline.remove()
	}else{
		const noOnlineDiv = document.createElement('div')
		noOnlineDiv.classList.add('noOnline')
		noOnlineDiv.innerText = `it's silent here for now!!`
		onlineList.append(noOnlineDiv)
	}
}
const sendMsg = ()=>{
	const message = messageInp.value;
	if (!message == ""){
		append(profileImg, selfname, message);
		socket.emit('send', {message: message, img: profileImg});
		messageInp.value = ''
		typing(messageInp.value)
	}
	else{    	
	    return
	}
}

form.addEventListener('submit', (e)=>{
    e.preventDefault()
	 sendMsg()
})

$(".loginForm").submit(function(evt){	 
   evt.preventDefault();
   var formData = new FormData($(this)[0]);
   $.ajax({
       url: '/',
       type: 'POST',
       data: formData,
       async: false,
       cache: false,
       contentType: false,
       enctype: 'multipart/form-data',
       processData: false,
       error: function(xhr, status, error){
       	console.log(error, xhr, status)
       },
       success: function (response) {
			setTimeout(function(){
				location.reload()
				console.log('hackerworkd')
			}, 1000)
		}
   });
	return false;

});

const loginForm = document.querySelector('.loginForm')
loginForm.addEventListener('submit', function(){
	const name = document.querySelector('.username').value
	const profileimg = document.querySelector('.profilepic').files[0].name
	localStorage.setItem("name", name)
	localStorage.setItem("profile", profileimg)
	socket.emit("newUserRegistered", {username: name, profile: profileimg})
})

$(form).keypress(function(event) {
   if (event.shiftKey && event.which === 13){
   		console.log("gamer")
   }else if (event.which == 13) {
      event.preventDefault();
      sendMsg()
   }
   
});

function updateScroll(){
		var element = document.getElementById("container-msg");
		element.scrollTop = element.scrollHeight;
}
