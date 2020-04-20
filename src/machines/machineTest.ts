import { interpret } from 'xstate';
import { authMachine } from './authMachine';

export const testService = interpret(authMachine)
  .onTransition((state) => {
    console.log({ state });
  })
  .start();

testService.send({ type: 'TRY_AUTH' });
