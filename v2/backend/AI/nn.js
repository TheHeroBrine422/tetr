const tf = require('@tensorflow/tfjs-node');


/** Simple Neural Network library that can only create neural networks of exactly 3 layers */
class NeuralNetwork {


    /**
     * Takes in the number of input nodes, hidden node and output nodes
     * @constructor
     * @param {number} input_nodes
     * @param {number} hidden_nodes
     * @param {number} output_nodes
     */
    constructor(input_nodes, hidden_nodes, output_nodes, node) {

        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        // Initialize random weights
        this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
        this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes]);
        this.node = node
    }

    /**
     * Takes in a 1D array and feed forwards through the network
     * @param {array} - Array of inputs
     */

    predict(user_input) {
        let output;
        tf.tidy(() => {
            /* Takes a 1D array */
            let input_layer = tf.tensor(user_input, [1, this.input_nodes]);
            let hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
            let output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
            output = output_layer.dataSync();
        });
        return output;
    }

    /**
     * Returns a new network with the same weights as this Neural Network
     * @returns {NeuralNetwork}
     */
    clone() {
        let clonie = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes, this.node);
        clonie.dispose();
        clonie.input_weights = tf.clone(this.input_weights);
        clonie.output_weights = tf.clone(this.output_weights);
        return clonie;
    }

    /**
     * Dispose the input and output weights from the memory
     */
    dispose() {
        this.input_weights.dispose();
        this.output_weights.dispose();
    }

    /**
     * Returns a new network that is a cross between the current network and the network that is passed in.
     * @param {NeuralNetwork}
     * @returns {[NeuralNetwork, NeuralNetwork]}
     */
    async crossover(NN) {
      let NN1 = this.clone()
      let NN2 = NN.clone()

      let genes1 = await NN1.flatten()
      let genes2 = await NN2.flatten()

      let pos = Math.floor(Math.random()*genes1.length)

      let temp1 = genes1.splice(0,pos)
      let temp2 = genes2.splice(0,pos)

      // just keeping this for future reference
      // genes1 = start g1
      // genes2 = start g2
      // temp1 = end g1
      // temp2 = end g2

      // genes1 = sg1+eg2
      // genes2 = sg2+eg1

      genes1 = genes1.concat(temp2)
      genes2 = genes2.concat(temp1)

      NN1.unflatten(genes1)
      NN2.unflatten(genes2)

      return [NN1, NN2];
    }

    async flatten() {
      let iw = await this.input_weights.array()
      let ow = await this.output_weights.array()

      iw = iw.flat()
      ow = ow.flat()
      return iw.concat(ow)
    }

    unflatten(arr) {
      this.input_weights = tf.tensor(arr.splice(0,this.input_nodes*this.hidden_nodes), [this.input_nodes, this.hidden_nodes])
      this.output_weights = tf.tensor(arr, [this.hidden_nodes,this.output_nodes])
    }

    async mutate(rate) {
      let flat = await this.flatten()

      for (var i = 0; i < flat.length; i++) {
        if (Math.random() < rate) {
          flat[i] = (await tf.randomNormal([1]).array())[0]
        }
      }
      this.unflatten(flat)
    }

    id() {
      if (!this.node) {
        return MurmurHash3(JSON.stringify(this.input_weights)+JSON.stringify(this.output_weights)).result().toString(16);
      } else {
        return require('crypto').createHash('sha1').update(JSON.stringify(this.input_weights)+JSON.stringify(this.output_weights)).digest('base64');
      }
    }
}

/*
async function test() {
  let NN1, NN2, NN3, NN4;
  NN1 = new NeuralNetwork(204, 16, 3)
  input = []
  for (var i = 0; i < 204; i++) {
    input[i] = 0
  }
  NN2 = new NeuralNetwork(204, 16, 3)
  temp = await NN1.crossover(NN2)
  NN3 = temp[0]
  NN4 = temp[1]
  console.log(NN1.predict(input))
  console.log(NN2.predict(input))
  console.log(NN3.predict(input))
  console.log(NN4.predict(input))
}

test()

async function test() {
  let NN1 = new NeuralNetwork(204, 16, 3)
  input = []
  for (var i = 0; i < 204; i++) {
    input[i] = 0
  }
  console.log(NN1.predict(input))
  NN1.mutate()
  console.log(NN1.predict(input))
}

test()
*/

module.exports = NeuralNetwork
