var StarsFrame = React.createClass({
    render: function () {
        var stars = [];
        for (var i = 0; i < this.props.numberOfStars; i++) {
            stars.push(
                <span className="glyphicon glyphicon-star"></span>
            );
        }
        return (
            <div id="stars-frame">
                <div className="well">
                    {stars}
                </div>
            </div>
        );
    }
});

var ButtonFrame = React.createClass({
    render: function () {
        var disabled, button, correct = this.props.correct;

        switch (correct) {
            case true:
                button = (
                    <button className="btn btn-success btn-lg"
                            onClick={this.props.acceptAnswer}>
                        <span className="glyphicon glyphicon-ok"></span>
                    </button>
                );
                break;
            case false:
                button = (
                    <button className="btn btn-danger btn-lg">
                        <span className="glyphicon glyphicon-remove"></span>
                    </button>
                );
                break;
            default:
                disabled = (this.props.selectedNumbers.length === 0);
                button = (
                    <button className="btn btn-primary btn-lg"
                            disabled={disabled}
                            onClick={this.props.checkAnswer}>
                        =
                    </button>
                );
        }

        return (
            <div id="button-frame">
                {button}
                <br /><br />
                <button className="btn btn-warning btn-xs"
                        onClick={this.props.redraw}
                        disabled={this.props.redraws === 0}>
                    <span className="glyphicon glyphicon-refresh"></span>
                    &nbsp;
                    {this.props.redraws}
                </button>
            </div>
        );
    }
});

var AnswerFrame = React.createClass({
    render: function () {
        var props = this.props;
        var selectedNumbers = props.selectedNumbers.map(function (i) {
            return (
                <span onClick={props.unselectNumber.bind(null, i)}>
          {i}
        </span>
            )
        });

        return (
            <div id="answer-frame">
                <div className="well">
                    {selectedNumbers}
                </div>
            </div>
        );
    }
});

var NumbersFrame = React.createClass({
    render: function () {
        var numbers = [], className,
            selectNumber = this.props.selectNumber,
            usedNumbers = this.props.usedNumbers,
            selectedNumbers = this.props.selectedNumbers;

        for (var i = 0; i <= 9; i++) {
            className = "number selected-" + (selectedNumbers.indexOf(i) >= 0)
            className += " used-" + (usedNumbers.indexOf(i) >= 0)
            numbers.push(
                <div className={className} onClick={selectNumber.bind(null, i)}>
                    {i}
                </div>
            );
        }

        return (
            <div id="numbers-frame">
                <div className="well">
                    {numbers}
                </div>
            </div>
        );
    }
});

var DoneFrame = React.createClass({
    render: function () {
        return (
            <div className="well text-center">
                <h2>{this.props.doneStatus}</h2>

                <button className="btn btn-default"
                        onClick={this.props.resetGame}>
                    Play again
                </button>
            </div>
        );
    }
});

var Game = React.createClass({
    getInitialState: function () {
        return {
            selectedNumbers: [],
            numberOfStars: this.randomNumber(),
            usedNumbers: [],
            redraws: 5,
            correct: null,
            doneStatus: null
        };
    },
    resetGame: function () {
        //this 1 merges states
        this.replaceState(this.getInitialState());
    },
    randomNumber: function () {
        return Math.floor(Math.random() * 9) + 1;
    },
    selectNumber: function (clickedNumber) {
        if (this.state.selectedNumbers.indexOf(clickedNumber) < 0) {
            this.setState({
                selectedNumbers: this.state.selectedNumbers.concat(clickedNumber),
                correct: null
            });
        }
    },
    unselectNumber: function (clickedNumber) {
        var selectedNumbers = this.state.selectedNumbers,
            indexOfNumber = selectedNumbers.indexOf(clickedNumber);

        selectedNumbers.splice(indexOfNumber, 1);
        this.setState({selectedNumbers: selectedNumbers})
    },
    sumOfSelectedNumbers: function () {
        return this.state.selectedNumbers.reduce(function (p, n) {
            return p + n;
        }, 0)
    },
    checkAnswer: function () {
        var correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
        this.setState({correct: correct});
    },
    acceptAnswer: function () {
        var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
        this.setState({
            selectedNumbers: [],
            usedNumbers: usedNumbers,
            correct: null,
            numberOfStars: this.randomNumber()
        }, function () {
            this.updateDoneStatus();
        });
    },
    redraw: function () {
        if (this.state.redraws > 0) {
            this.setState({
                selectedNumbers: [],
                correct: null,
                redraws: this.state.redraws - 1,
                numberOfStars: this.randomNumber()
            }, function () {
                this.updateDoneStatus();
            });
        }
    },
    possibleCombinationSum: function (arr, n) {
        //typical array algorithm problem regarding possible combinations
        if (arr.indexOf(n) >= 0) {
            return true;
        }
        if (arr[0] > n) {
            return false;
        }
        if (arr[arr.length - 1] > n) {
            arr.pop();
            return this.possibleCombinationSum(arr, n);
        }
        var listSize = arr.length, combinationsCount = (1 << listSize)
        for (var i = 1; i < combinationsCount; i++) {
            var combinationSum = 0;
            for (var j = 0; j < listSize; j++) {
                if (i & (1 << j)) {
                    combinationSum += arr[j];
                }
            }
            if (n === combinationSum) {
                return true;
            }
        }
        return false;
    },
    possibleSolutions: function (usedNumbers) {
        var numberOfStars = this.state.numberOfStars,
            possibleNumbers = [],
            redraws = this.state.redraws;

        for (var i = 1; i <= 9; i++) {
            if (usedNumbers.indexOf(i) < 0) {
                possibleNumbers.push(i);
            }
        }

        return this.possibleCombinationSum(possibleNumbers, numberOfStars);
    },
    updateDoneStatus: function () {
        if (this.state.usedNumbers.length === 9) {
            this.setState({doneStatus: 'Done. Nice!'});
            return;
        }
        if (this.state.redraws === 0 && !this.possibleSolutions(this.state.usedNumbers)) {
            this.setState({doneStatus: 'Game Over!'});
        }
    },
    render: function () {
        var selectedNumbers = this.state.selectedNumbers,
            numberOfStars = this.state.numberOfStars,
            correct = this.state.correct,
            redraws = this.state.redraws,
            usedNumbers = this.state.usedNumbers,
            doneStatus = this.state.doneStatus,
            bottomFrame;

        if (doneStatus) {
            bottomFrame = <DoneFrame doneStatus={doneStatus}
                                     resetGame={this.resetGame}/>;
        } else {
            bottomFrame = <NumbersFrame selectedNumbers={selectedNumbers}
                                        usedNumbers={usedNumbers}
                                        selectNumber={this.selectNumber}/>;
        }
        return (
            <div id="game">
                <h2>Play Nine! <br />(Match the numbers with the stars to win, {this.state.redraws} more tries)</h2>
                <hr />
                <div className="clearfix">
                    <StarsFrame numberOfStars={numberOfStars}/>
                    <ButtonFrame selectedNumbers={selectedNumbers}
                                 correct={correct}
                                 checkAnswer={this.checkAnswer}
                                 redraws={redraws}
                                 acceptAnswer={this.acceptAnswer}
                                 redraw={this.redraw}/>
                    <AnswerFrame selectedNumbers={selectedNumbers}
                                 unselectNumber={this.unselectNumber}/>
                </div>

                {bottomFrame}

            </div>
        );
    }
});

React.render(
    <Game />,
    document.getElementById('container')
);
