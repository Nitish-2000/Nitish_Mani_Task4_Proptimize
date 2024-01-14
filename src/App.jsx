import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

function App() {
 
  
  const [typing, setTyping] = useState(false);
  let [message, setMessage] = useState([
    {
      message: "Hello! How can I help you today?",
      sender: "user",
    },
  ]);

  let hadleSend = async (messages) => {
    const newMessage = {
      message: messages,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...message, newMessage];
    setMessage(newMessages);
    setTyping(true);

    await processMessage(newMessages);
  };

  async function processMessage(chatMessages) {
    let apiMessage = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender == "ChatGPT") {
        role == "assistant";
      } else {
        role == "user";
      }
      return { role: role, content: messageObject.message };
    });
    const systemMessage = {
      role: "system",
      content: "Explain all queries in advanced language",
    };
    const apirequestBody = {
      model: "gpt-3.5-turbo",
      message: [systemMessage, ...apiMessage],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      headers: {
        Authorization: "Bearer " + import.meta.env.VITE_API_Key,
        "content-Type": "Application/json",
      },
      body: JSON.stringify(apirequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        if (data.status == 200) {
          setMessage([
            ...chatMessages,
            {
              message: data.choices.message.content,
              sender: "ChatGPT",
            },
          ]);
        } else {
          let errors = data.error.message;
          console.log(errors);
          setMessage([
            ...chatMessages,
            {
              message: errors,
              sender: "ChatGPt",
            },
          ]);
        }
      });
    setTyping(false);
  }
  return (
    <div className="App">
      <div style={{ position: "relative", height: "570px", width: "1360px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                typing ? <TypingIndicator content="Fetching your data" /> : null
              }
            >
              {message.map((messages, i) => {
                return <Message key={i} model={messages}></Message>;
              })}
            </MessageList>
            <MessageInput
              placeholder="Enter your text here"
              onSend={hadleSend}
            ></MessageInput>
          </ChatContainer>
        </MainContainer>
      </div>
      {/* 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 */}
    </div>
  );
}

export default App;
