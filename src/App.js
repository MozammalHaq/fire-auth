import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);


function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSigndIn: false,
    name: '',
    email: '',
    photo: ''
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  //Method
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const singnedInUser = {
          isSigndIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(singnedInUser);
        // console.log(displayName, email, photoURL);
      })
      .catch(err => {
        console.log(err);
        console.log(err.message)
      })
  }

  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;
        console.log('facebook', user)

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }

  //Sign Out
  const handleSignOut = () => {
    // console.log('SignOut Clicked')
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSigndIn: false,
          name: '',
          photo: '',
          email: '',
          password: '',
          error: '',
          success: false
        }
        setUser(signedOutUser);
        console.log(res);
      })
      .catch(err => {

      })
  }

  // const handleBlur = (e) => {
  //   // কোন ফিল্ডে লেখা হচ্ছে সেটা জানার জন্য name ব্যবহার করতে হবে। 
  //   console.log(e.target.name, e.target.value)
  //   if (e.target.name === 'email') {
  //     const isEmailValid = /\S+@\S+\.\S+/.test(e.target.value);
  //     console.log(isEmailValid);
  //   }
  //   if (e.target.name === 'password') {
  //     const isPasswordValid = e.target.value.length > 6;
  //     const passwodHasNumber = /\d{1}/.test(e.target.value);
  //     console.log(isPasswordValid && passwodHasNumber);
  //   }
  // }

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwodHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwodHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    //যদি নিচের দুটি থাকে তবে সাব মিট কর।
    if (newUser && user.email && user.password) {
      // console.log('submitting');
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log('sign in user info', res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    e.preventDefault(); //সাধারণত সাবমিট করলে ফুল পেজ রিলোড হয়। এটা দিলে হয় না।
  }

  // update user name
  const updateUserName = name => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function () {
      console.log('Update successful.')
    }).catch(function (error) {
      console.log(error)
    });
  }


  return (
    <div className="App">
      {
        user.isSigndIn
          ? <button onClick={handleSignOut}>Sign Out</button>
          : <button onClick={handleSignIn}>Sign In with google</button>
      }
      <br />
      <br />
      <button onClick={handleFbSignIn}>sign in with facebook</button>
      {
        user.isSigndIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email address: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>Our own Authentication</h1>
      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      {/* () => setNewUser(!newUser) মানে আগের অবস্থাকে উল্টিয়ে দাও। */}
      <label htmlFor="newUser">New User Sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Your name" />}<br />
        {/* <input type="text" name="email" onChange={handleChange} placeholder="Your Email" required /> */}
        <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder="Enter Password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'loged in'} successfully</p>}
    </div>
  );
}

export default App;
