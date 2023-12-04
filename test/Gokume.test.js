import { expect } from 'chai';
import Gokume from '../src/Gokume.js'; // Adjust the path accordingly

describe('Gokume', () => {
    let game;

    beforeEach(() => {
        game = new Gokume(7, 6); // Adjust the dimensions as needed
    });

    it('should put a piece on the board', () => {
        game.addPlayer(1);
        game.addPlayer(2);

        game.putPiece(0, 0, 1);

        // Check if the cell has the correct player and color
        expect(game.board[0][0].player).to.equal(1);
        expect(game.board[0][0].color).to.equal('#000000');
    });

    // Add more test cases as needed

});
