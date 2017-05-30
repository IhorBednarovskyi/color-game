'use strict';

angular.module('colorApp', [])
  .constant('colorList', [{
    id: 'red',
    label: 'Red',
    hex: '#d13434'
  }, {
    id: 'aqua',
    label: 'Aqua',
    hex: '#00ffff'
  }, {
    id: 'green',
    label: 'Green',
    hex: '#008000'
  }, {
    id: 'black',
    label: 'Black',
    hex: '#000'
  }, {
    id: 'orange',
    label: 'Orange',
    hex: '#ffa500'
  }, {
    id: 'blue',
    label: 'Blue',
    hex: '#0000ff'
  }, {
    id: 'grey',
    label: 'Grey',
    hex: '#808080'
  }, {
    id: 'purple',
    label: 'Purple',
    hex: '#800080'
  }])
  .factory('colorService', ['$interval', 'colorList', function ($interval, colorList) {
    return {
      findById: function (id) {
        return colorList.find((color) => color.id == id);
      },
      getRandom: function () {
        let color = this.getRandomFromSample(colorList);

        return Object.assign({}, color, {
          label: this.getRandomLabel(color.label).label
        });
      },
      getRandomLabel: function (...except) {
        let sample = colorList.filter((color) => {
          return !except.includes(color.label);
        });

        return this.getRandomFromSample(sample);
      },
      getRandomHex: function (...except) {
        let sample = colorList.filter((color) => {
          return !except.includes(color.hex);
        });

        return this.getRandomFromSample(sample);
      },
      getRandomFromSample: function (sample) {
        return sample[Math.floor(Math.random() * sample.length)];
      }
    }
  }])
  .controller('ColorCtrl', ['$scope', '$timeout', '$interval', 'colorService',
    function ($scope, $timeout, $interval, colorService) {
      const COUNTDOWN = 5;
      const ROUNDS = 10;

      let vm = this,
        intervalCounter;

      this.$onInit = function () {
        this.score = 0;
        this.round = 0;
        this.robot = false;
        this.finish = false;

        $scope.$watch(function () {
          return vm.robot;
        }, function (value, prevValue) {
          if (value !== prevValue) {
            robotMode();
          }
        });

        createQuestionView();
      };

      this.onAnswer = function (id) {
        this.round += 1;

        if (this.data.question.id === id) {
          this.score += 1
        }

        if (this.round === ROUNDS) {
          this.finish = true;
        } else {
          createQuestionView();
        }

        $interval.cancel(intervalCounter);
      };

      function createQuestionView() {
        vm.coundown = COUNTDOWN;
        vm.data = generateQuestion();

        intervalCounter = $interval(() => {
          vm.coundown -= 1;

          if (!vm.coundown) {
            vm.onAnswer(null);
          }
        }, 1000);

        if (!vm.finish) {
          robotMode();
        }
      }

      function generateQuestion() {
        let question = colorService.getRandom(),
          isReverse = !!Math.round(Math.random()),
          options = [];

        // Fake label
        question.label = colorService.getRandomLabel(question.label).label;

        options.push({
          id: question.id,
          label: colorService.findById(question.id).label,
          hex: colorService.getRandomHex(question.hex).hex
        });

        options.push({
          label: colorService.getRandomLabel(options[0].label, question.label).label,
          hex: colorService.getRandomHex(options[0].hex, question.hex).hex
        });

        if (isReverse) {
          options = options.reverse();
        }

        return {
          question: question,
          options: options
        }
      }

      function robotMode() {
        if (vm.robot) {
          $timeout(() => {
            vm.onAnswer(vm.data.question.id);
          }, 1000);
        }
      }
    }])
  .component('view', {
    template: `
      <style>
          .container {
              padding: 10px;
          }
          .button {
              padding: 5px;
              margin: 0 5px;
              background: transparent;
          }
          .question {
              text-align: center;
          }
      </style>
      
      <div class="container">
        <div ng-if="$ctrl.finish">
            <result score="$ctrl.score"></result>
        </div>
        <div class="question" ng-if="!$ctrl.finish">
         <h3>
              Countdown: {{$ctrl.coundown}} sec
         </h3>
         <h3 style="color: {{ $ctrl.data.question.hex }}">
            {{ $ctrl.data.question.label }}
        </h3>
    
        <button  class="button" ng-repeat="option in $ctrl.data.options" style="border-color: {{ option.hex }}" 
          ng-click="$ctrl.onAnswer(option.id)">
          {{ option.label }}
        </button>
        <div>
          <label>Robot mode: <input type="checkbox" ng-model="$ctrl.robot"/></label>
        </div>
      </div>
      </div>
  `,
    controller: 'ColorCtrl'
  })
  .component('result', {
    template: `<span>Your score: {{ $ctrl.score }}</span>`,
    bindings: {
      score: '<'
    }
  });
