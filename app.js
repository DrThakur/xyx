// Streaming Response
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // return chat <li> element
};

const generateResponse = async (chatElement) => {
  // const API_URL = "https://10.0.0.59:8000/streaming/ask";
  // const API_URL = "http://10.0.0.59:8086/v1/completion";
  // const API_URL = "https://14.97.108.50:8086/v1/completion";
  // const API_URL = "https://10.0.0.64:8001/completion";
  const API_URL = "https://testai.arincinsider.com/completion";
  const messageElement = chatElement.querySelector("p");

  //Construct the API URL with the user's message
  const queryParam = encodeURIComponent(userMessage);
  console.log("my query",queryParam);
  const requestedURL = `${API_URL}?query=${queryParam}`;

  console.log("My Requested url", requestedURL);
try {
  //   const response = await fetch(requestedURL);

  // if (!response.ok) {
  //   throw new Error("Network response was not ok");
  // }

  const response = await fetch(requestedURL, { 
    method: 'GET', 
    headers: { 
        'Content-Type': 'application/json'
    },
    // credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow',
    referrerPolicy: 'strict-origin-when-cross-origin',
    // agent: new https.Agent({ rejectUnauthorized: false })
})


  const reader = response.body.getReader();
  console.log("MY reader", reader);

  const decoder = new TextDecoder();
  let decodedText= '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    decodedText+=  decoder.decode(value);
    //decodedText += decoder.decode(value, { stream: true });
    messageElement.textContent= decodedText;
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }

  console.log("my decoded text", decodedText);
  console.log("my decoded text length", decodedText.split(" ").length)
} catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent= "Oops! Something went wrong. Please try again.";
    console.error("Fetch error", error);
    chatbox.scrollTo(0, chatbox.scrollHeight);
}
  
};

const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);