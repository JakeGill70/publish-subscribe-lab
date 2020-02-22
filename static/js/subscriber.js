var socket = {}
            var subscriber = {}
            $(document).ready(function(){
                var subscriberName = prompt("What is your subscriber name?");

                socket = io.connect("http://" + document.domain + ":" + location.port + "/");
                var notifications_received = [];

                getSubscriberInfo(subscriberName);

                // Publish Subscriber Infomation
                $("#subscriptionRequest").on("submit", function(e){
                    // Prevent the form submission from refreshing the page
                    e.preventDefault();

                    // Get data from form
                    var formDataRaw = $("#subscriptionRequest").serializeArray();
                    // Format it into a single JS object
                    var formData = convertFormArrayToAssociativeArray(formDataRaw);
                    // Save a local copy for filtering
                    subscriber = formData;
                    // Send form data to the server as JSON
                    socket.emit("subscriber", formData);
                });

                // Catch "publication" event
                socket.on("publication", function(msg){
                    // Convert the message content to a JSON string
                    let content_string = JSON.stringify(msg.content);

                    // Add the new notification if it updates the current subscriber information
                    if(msg.content.subscriberName != undefined && msg.content.subscriberName == subscriber.subscriberName){
                        notifications_received.push(content_string);
                    }

                    // If the notification is about a tell
                    if(msg.content.id != undefined){
                        // Add the new notification if it is about something that I have subscribed to
                        let subTitles = subscriber.titles.split(",");
                        let subTellers = subscriber.tellers.split(",");
                        let subKeywords = subscriber.keywords.split(",");
                        let conTitles = stringContainsAnyElement(msg.content.title, subTitles);
                        let conTellers = stringContainsAnyElement(msg.content.teller, subTellers);
                        let conKeywords = stringContainsAnyElement(msg.content.keyword, subKeywords);
                        console.log([msg.content.title, subTitles, conTitles]);
                        console.log([msg.content.teller, subTellers, conTellers]);
                        console.log([msg.content.keyword, subKeywords, conTellers]);
                        if(conTitles || conTellers || conKeywords){
                                notifications_received.push(content_string);
                        }
                    }
                    notifications_received.push("DEBUG: " + content_string);

                    // Create the HTML for presenting all of the notifications
                    numbers_string = "";
                    for (let i = 0; i < notifications_received.length; i++) {
                        numbers_string = numbers_string + "<p>" + notifications_received[i] + "</p>";
                    }
                    
                    // Inject the HTML into the page
                    $("#log").html(numbers_string);
                })
            });

            function stringContainsAnyElement(mainString, strArray){
                let output = false
                strArray.forEach(subString => {
                    subsString = $.trim(subString);
                    if(subString !== "" && mainString.indexOf(subString > -1)){
                        output = true;
                    }
                });
                return output;
            }

            function getSubscriberInfo(subscriberName){
                payload = {"subscriberName":subscriberName}
                $.ajax({
                    url:"./user",
                    type:"GET",
                    contentType:"application/json; charset=utf-8",
                    data:payload,
                    success:function(response){
                        // If the user has an active subscription
                        let subscriber = {}
                        if(response != "none"){
                            subscriber = JSON.parse(response);
                        }
                        else {
                            subscriber = {"subscriberName": subscriberName,
                                            "titles": "", "tellers": "", "keywords": ""}
                        }
                        console.log(["+++", subscriber, "+++"]);
                        setSubscriberInfo(subscriber);
                        populateFormWithSubscriberInfo(subscriber);
                    }
                })
            }

            function setSubscriberInfo(subscription){
                subscriber = subscription;
            }

            function populateFormWithSubscriberInfo(subscriber){
                let subscriberName = subscriber.subscriberName;
                let titles = subscriber.titles;
                let tellers = subscriber.tellers;
                let keywords = subscriber.keywords;
                $("#subscriberName").val(subscriberName);
                $("#titles").val(titles);
                $("#tellers").val(tellers);
                $("#keywords").val(keywords);
            }

            function convertFormArrayToAssociativeArray(formArray){
                var formDataFormatted = {};
                formArray.forEach(input => {
                    formDataFormatted[input.name] = input.value
                });
                return formDataFormatted
            }