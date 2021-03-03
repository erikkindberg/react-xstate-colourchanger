import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

const grammar: { [index: string]: { person?: string, day?: string, time?: string, bool?: boolean } } = {
    "John": { person: "John Appleseed" },
    "on Friday": { day: "Friday" },
    "at ten": { time: "10:00" },
    "yes": {bool: true},
    "no": {bool: false}
}


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },
        who: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Who are you meeting with?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't know them"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "day" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                    target: "whole_day"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("On which day is your meeting?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry, that's not a day I know."),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        whole_day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "bool" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { bool: grammar[context.recResult].bool } }),
                    target: ".confirm"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Will the appointment take the whole day?"),
                    on: {ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry, I did not catch that"),
                    on: { ENDSPEECH: "prompt" }
                }
                
                }
            }
        }
    
})
