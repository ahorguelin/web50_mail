# web50_mail

Third project from Harvardx' Web50 on edX. Project brief [here](https://cs50.harvard.edu/web/2020/projects/3/mail/)

## Goal of the project

Get more comfortable with manipulating the DOM using only vanilla Js. Using Python APIs created using the Django framework to create a single page web application that allows users to send messages to others app users. It must be noted that for this project, most of the HTML and the entierety of the Python code was provided. 

## Features

### Mailboxes 

Users have access to three different mailboxes:
1. Inbox
2. Sent
3. Archived

### Send email

Users can send emails to other users on the app. Users can use a form which content is then retrieved using JavaScript and query selector. 
One the content is obtained, it is then formatted in Json and sent to the server using the provided API. 

### Archive and consult emails

When querying the Inbox and Archived mailboxes, a call to the provided API is sent. The data is then retrieved and formated in a Json format. It is then used to insert HTML elements in the DOM. 

### Reply to emails

When using this feature, a call to the API is made. This allows to retrieve the information related to the email in a Json format. This information is then used to inject HTML elements into the form so that the user has minimum inputs to make themselves. 



