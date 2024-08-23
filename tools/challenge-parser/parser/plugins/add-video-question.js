const { root } = require('mdast-builder');
const find = require('unist-util-find');
const getAllBetween = require('./utils/between-headings');
const getAllBefore = require('./utils/before-heading');
const mdastToHtml = require('./utils/mdast-to-html');

const { splitOnThematicBreak } = require('./utils/split-on-thematic-break');

function plugin() {
  return transformer;
  function transformer(tree, file) {
    const allQuestionNodes = getAllBetween(tree, '--questions--');

    if (allQuestionNodes.length > 0) {
      const questions = [];
      const questionTrees = [];
      let questionTreeNumber = -1;

      allQuestionNodes.forEach(questionNode => {
        if (
          questionNode.children &&
          questionNode.children[0] &&
          questionNode.children[0].value === '--text--'
        ) {
          questionTreeNumber++;
          questionTrees[questionTreeNumber] = [];
        }

        questionTrees[questionTreeNumber].push(questionNode);
      });

      questionTrees.forEach(questionNodes => {
        const questionTree = root(questionNodes);

        const textNodes = getAllBetween(questionTree, '--text--');
        const answersNodes = getAllBetween(questionTree, '--answers--');
        const solutionNodes = getAllBetween(questionTree, '--video-solution--');

        questions.push(getQuestion(textNodes, answersNodes, solutionNodes));
      });

      file.data.questions = questions;
    }
  }
}

function getQuestion(textNodes, answersNodes, solutionNodes) {
  const text = mdastToHtml(textNodes);
  const answers = getAnswers(answersNodes);
  const solution = getSolution(solutionNodes);

  if (!text) throw Error('text is missing from question');
  if (!answers) throw Error('answers are missing from question');
  if (!solution) throw Error('solution is missing from question');

  return { text, answers, solution };
}

function getAnswers(answersNodes) {
  const answerGroups = splitOnThematicBreak(answersNodes);

  return answerGroups.map(answerGroup => {
    const answerTree = root(answerGroup);
    const feedback = find(answerTree, { value: '--feedback--' });

    if (feedback) {
      const answerNodes = getAllBefore(answerTree, '--feedback--');
      const feedbackNodes = getAllBetween(answerTree, '--feedback--');

      if (answerNodes.length < 1) {
        throw Error('Answer missing');
      }

      return {
        answer: mdastToHtml(answerNodes),
        feedback: mdastToHtml(feedbackNodes)
      };
    }

    return { answer: mdastToHtml(answerGroup), feedback: null };
  });
}

function getSolution(solutionNodes) {
  let solution;
  try {
    if (solutionNodes.length > 1) throw Error('Too many nodes');
    if (solutionNodes[0].children.length > 1)
      throw Error('Too many child nodes');
    const solutionString = solutionNodes[0].children[0].value;
    if (solutionString === '') throw Error('Non-empty string required');

    solution = Number(solutionString);
    if (Number.isNaN(solution)) throw Error('Not a number');
    if (solution < 1) throw Error('Not positive number');
  } catch (e) {
    console.log(e);
    throw Error('A video solution should be a positive integer');
  }

  return solution;
}

module.exports = plugin;
