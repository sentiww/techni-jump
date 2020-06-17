interface segmentsArrInterface {
  data: number[][],
  connections: string,
  name: string
}

export default class LevelGenerator {
  public generateSequence(segmentsArr: segmentsArrInterface[], startingName: string, length: number): string[] {
    let sequence: string[] = [startingName];

    for (let i: number = 0; i < length; i++) {
      let avConnections: string[] = segmentsArr.find((el: segmentsArrInterface) => {
                                      return el.name === sequence[sequence.length - 1];
                                    }).connections.split(',');
      let randIndex = this.randomNumber(0, avConnections.length);
      sequence.push(avConnections[randIndex]);
    }

    return sequence;
  }

  private randomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
