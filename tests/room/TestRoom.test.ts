import { ColyseusTestServer, boot } from '@colyseus/testing';
import { assert } from 'chai';
import { Container } from 'typedi';

import { State } from '@Controllers/room/TestRoom';

import { _after, _before } from '../bootstrap';

describe('testing your Colyseus app', () => {
  let colyseus: ColyseusTestServer;

  before(async () => {
    await _before();
    colyseus = await boot(Container.get('gameServer'));
  });

  after(async () => {
    await _after();
  });

  beforeEach(async () => await colyseus.cleanup());

  it('connecting into a room', async() => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom('test', {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo<State>(room);
    client1.send('move', { x:10, y:10 });
    await room.waitForNextPatch();
    // make your assertions
    assert.strictEqual(room.state.players[client1.sessionId].x, 10);
    assert.strictEqual(room.state.players[client1.sessionId].y, 10);
  });
});
