document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#reply').addEventListener('click', (event) => reply(event))

  //Detecting that the user clicked to send an email
  document.querySelector('#compose-form').addEventListener('submit', (event) => {

    //Added the event.preventDefault so that JS could access the form itself. Found solution to my problem by reading about a similar issue in https://stackoverflow.com/questions/59176488/networkerror-when-attempting-to-fetch-resource-only-on-firefox#:~:text=So%2C%20guys%2C%20here%27s%20the%20solution.%20The%20problem%20was,refresh%20the%20form%20on%20response%2C%20and%20is%20done%21
    
    event.preventDefault();
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#reading-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  function load_mailbox(mailbox) {
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#reading-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    load_emails(mailbox)
  }

  //Send email logic
  function send_email(){

    //gather data from the form
    let emailRecipients = document.querySelector('#compose-recipients').value;
    let emailSubject = document.querySelector('#compose-subject').value;
    let emailBody = document.querySelector('#compose-body').value;

    //query the API and pass the data
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: emailRecipients,
        subject: emailSubject,
        body: emailBody
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.message === "Email sent successfully."){
        //redirect user to sent emails
        load_mailbox('sent');
      }
      else{
        alert('Email could not be sent')
      }
    });


}

function load_emails(mailbox){
  //use the API to dynamically retrieve a JSON of the selected mailbox based on the button
  fetch(`/emails/${mailbox}`,{
    method: 'GET',
  })
  .then(result => result.json())
  .then(content =>{
    // console.log(content);

    //create an div based on the fetched result
    content.forEach(mail => {
      const element = document.createElement('div');
      
      //check for read email and add a class if true
      if (mail.read === true){
        element.classList.add('gray-bg');
      }
      
      //add a class to the div to be styled in css
      element.classList.add('border-div');

      //add a custom data to the div so that the email Id can be fetched using js and is read
      element.setAttribute('data-id', mail.id);
      element.setAttribute('data-read', mail.read);

      //add the element in the file with an event lister to read the mail
      element.addEventListener('click', (event) => {
        //verifies the element clicked in indeed the div with the data
        if (event.target === element){
          read(event)
        }
      })

      //add the email information to the created div
      //create two divs to accept the data
      const senderSubject = document.createElement('div');
      senderSubject.classList.add('inline-div');
      const mailInfo = document.createElement('div');
      mailInfo.classList.add('inline-div'); 

      //sender information
      const sender = document.createElement('h5');
      sender.classList.add('bold-text');
      sender.innerHTML = mail.sender;

      //subject information
      const subject = document.createElement('h6');
      subject.innerHTML = mail.subject;

      //timestamp information
      const timestamp = document.createElement('p');
      timestamp.innerHTML = mail.timestamp
      
      //add all the elements to the divs
      senderSubject.append(sender, subject)
      mailInfo.append(timestamp)



      //check which mailbox was loaded. If inbox, load the 'archive' button. If archived, load the 'unarchive' button
      if (mailbox !== 'sent'){
        const button = document.createElement('button');
        
        if (mail.archived === true){
          button.innerHTML = 'Unarchive';
        } 
        else{
          button.innerHTML = 'Archive';
        }
        button.addEventListener('click', (event) => archive(event));
        button.classList.add('btn', 'btn-sm', 'btn-outline-primary');
        mailInfo.append(button);
      }
      
      //add all the data to the HTML file
      element.append(senderSubject, mailInfo)
      document.querySelector('#emails-view').append(element);
    })

  });

}

//grab a specific email from the DB and show it to the user
function read(email){
  //clear the previously loaded email
  document.querySelector('#mail').innerHTML = ''

  fetch(`/emails/${email.target.dataset.id}`,{
    method: 'GET'
  })
  .then(result => result.json())
  .then(content =>{
    //create the div containing the email info
    email = document.querySelector('#mail');
    
    //set the data attribute to have the email id on the div
    email.setAttribute('data-id', content.id)

    //add the email info to the div one at a time
    const sender = document.createElement('h5');
    sender.innerHTML = `From: ${content.sender}`;
    email.appendChild(sender);

    const receiver = document.createElement('h5');
    receiver.innerHTML = `To: ${content.recipients}`;
    email.appendChild(receiver);

    const subject = document.createElement('h5');
    subject.innerHTML = `Subject: ${content.subject}`;
    email.appendChild(subject);

    const timestamp = document.createElement('h6');
    timestamp.innerHTML = content.timestamp;
    email.appendChild(timestamp);

    const body = document.createElement('p');
    body.innerHTML = content.body;
    email.appendChild(body);

    //add the email querried by the user. Method to insert the email before the button found here: https://stackoverflow.com/questions/2007357/how-to-set-dom-element-as-first-child
    document.querySelector('#reading-view').insertBefore(email, document.querySelector('#reading-view').firstChild);

  })
  
  //check whether the email was read prior to toggling its state
  if (email.target.dataset.read === 'false'){
    fetch(`/emails/${email.target.dataset.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })    
  }
  
  //display the correct view to the user
  document.querySelector('#reading-view').style.display = 'block'
  document.querySelector('#emails-view').style.display = 'none'
}

//archive and unarchive an email
function archive(email){
    
  let archivedAction;
  if (email.target.innerHTML === "Archive"){
    archivedAction = true;
  }
  else{
    archivedAction = false;
  }

  //As the button is within a div within a div containing the data necessary to fetch the email, the query is convoluted
  fetch(`/emails/${email.target.parentElement.parentElement.dataset.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archivedAction
    })
  })
  .then(response => {
    if (response.status === 204){
      load_mailbox('inbox')
    }
    else{
      alert('Error, please try again')
    }
  })
}

function reply(email){
  //fetch the email based on the data in the div next to the button
  fetch(`/emails/${email.target.previousElementSibling.dataset.id}`,{
    method: 'GET'
  })
  .then(result => result.json())
  .then(content => {
    compose_email()
    document.querySelector('#compose-recipients').value = content.sender;
    document.querySelector('#compose-subject').value = `Re: ${content.subject}`;
    document.querySelector('#compose-body').value = `On ${content.timestamp}, ${content.sender} wrote: ${content.body}`;  

  })
  
}