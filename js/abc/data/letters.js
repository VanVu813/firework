'use strict';

/* ---------- 26 个英文字母词库（emoji 即插图，say 为 TTS 朗读文本） ---------- */
const LETTERS = [
  { letter: 'A', words: [
    { emoji: '🍎', en: 'Apple', zh: '苹果', say: 'apple' },
    { emoji: '✈️', en: 'Airplane', zh: '飞机', say: 'airplane' },
    { emoji: '🐜', en: 'Ant', zh: '蚂蚁', say: 'ant' },
    { emoji: '🥑', en: 'Avocado', zh: '牛油果', say: 'avocado' },
  ]},
  { letter: 'B', words: [
    { emoji: '🍌', en: 'Banana', zh: '香蕉', say: 'banana' },
    { emoji: '🐻', en: 'Bear', zh: '熊', say: 'bear' },
    { emoji: '⚽', en: 'Ball', zh: '球', say: 'ball' },
    { emoji: '🦋', en: 'Butterfly', zh: '蝴蝶', say: 'butterfly' },
  ]},
  { letter: 'C', words: [
    { emoji: '🐱', en: 'Cat', zh: '猫', say: 'cat' },
    { emoji: '🍪', en: 'Cookie', zh: '饼干', say: 'cookie' },
    { emoji: '🐄', en: 'Cow', zh: '奶牛', say: 'cow' },
    { emoji: '☁️', en: 'Cloud', zh: '云', say: 'cloud' },
  ]},
  { letter: 'D', words: [
    { emoji: '🐶', en: 'Dog', zh: '狗', say: 'dog' },
    { emoji: '🦆', en: 'Duck', zh: '鸭子', say: 'duck' },
    { emoji: '🐬', en: 'Dolphin', zh: '海豚', say: 'dolphin' },
    { emoji: '🍩', en: 'Donut', zh: '甜甜圈', say: 'donut' },
  ]},
  { letter: 'E', words: [
    { emoji: '🐘', en: 'Elephant', zh: '大象', say: 'elephant' },
    { emoji: '🥚', en: 'Egg', zh: '鸡蛋', say: 'egg' },
    { emoji: '🦅', en: 'Eagle', zh: '老鹰', say: 'eagle' },
    { emoji: '👁️', en: 'Eye', zh: '眼睛', say: 'eye' },
  ]},
  { letter: 'F', words: [
    { emoji: '🐟', en: 'Fish', zh: '鱼', say: 'fish' },
    { emoji: '🍟', en: 'Fries', zh: '薯条', say: 'french fries' },
    { emoji: '🐸', en: 'Frog', zh: '青蛙', say: 'frog' },
    { emoji: '🌸', en: 'Flower', zh: '花', say: 'flower' },
  ]},
  { letter: 'G', words: [
    { emoji: '🍇', en: 'Grapes', zh: '葡萄', say: 'grapes' },
    { emoji: '🦒', en: 'Giraffe', zh: '长颈鹿', say: 'giraffe' },
    { emoji: '🐐', en: 'Goat', zh: '山羊', say: 'goat' },
    { emoji: '🎁', en: 'Gift', zh: '礼物', say: 'gift' },
  ]},
  { letter: 'H', words: [
    { emoji: '🏠', en: 'House', zh: '房子', say: 'house' },
    { emoji: '🐴', en: 'Horse', zh: '马', say: 'horse' },
    { emoji: '🍔', en: 'Hamburger', zh: '汉堡包', say: 'hamburger' },
    { emoji: '🦛', en: 'Hippo', zh: '河马', say: 'hippopotamus' },
  ]},
  { letter: 'I', words: [
    { emoji: '🍦', en: 'Ice cream', zh: '冰淇淋', say: 'ice cream' },
    { emoji: '🦎', en: 'Iguana', zh: '鬣蜥', say: 'iguana' },
    { emoji: '🏝️', en: 'Island', zh: '小岛', say: 'island' },
    { emoji: '🖋️', en: 'Ink', zh: '墨水', say: 'ink' },
  ]},
  { letter: 'J', words: [
    { emoji: '🧃', en: 'Juice', zh: '果汁', say: 'juice' },
    { emoji: '🛩️', en: 'Jet', zh: '喷气飞机', say: 'jet' },
    { emoji: '🪀', en: 'Yo-yo', zh: '悠悠球', say: 'yo-yo' },
    { emoji: '🩳', en: 'Jeans', zh: '牛仔裤', say: 'jeans' },
  ]},
  { letter: 'K', words: [
    { emoji: '🪁', en: 'Kite', zh: '风筝', say: 'kite' },
    { emoji: '🦘', en: 'Kangaroo', zh: '袋鼠', say: 'kangaroo' },
    { emoji: '🔑', en: 'Key', zh: '钥匙', say: 'key' },
    { emoji: '🐨', en: 'Koala', zh: '考拉', say: 'koala' },
  ]},
  { letter: 'L', words: [
    { emoji: '🦁', en: 'Lion', zh: '狮子', say: 'lion' },
    { emoji: '🍋', en: 'Lemon', zh: '柠檬', say: 'lemon' },
    { emoji: '🦎', en: 'Lizard', zh: '蜥蜴', say: 'lizard' },
    { emoji: '🍀', en: 'Clover', zh: '四叶草', say: 'clover' },
  ]},
  { letter: 'M', words: [
    { emoji: '🐵', en: 'Monkey', zh: '猴子', say: 'monkey' },
    { emoji: '🌙', en: 'Moon', zh: '月亮', say: 'moon' },
    { emoji: '🍈', en: 'Melon', zh: '甜瓜', say: 'melon' },
    { emoji: '⛰️', en: 'Mountain', zh: '高山', say: 'mountain' },
  ]},
  { letter: 'N', words: [
    { emoji: '🪺', en: 'Nest', zh: '鸟巢', say: 'nest' },
    { emoji: '🥜', en: 'Nuts', zh: '坚果', say: 'nuts' },
    { emoji: '👃', en: 'Nose', zh: '鼻子', say: 'nose' },
    { emoji: '🎵', en: 'Note', zh: '音符', say: 'music note' },
  ]},
  { letter: 'O', words: [
    { emoji: '🍊', en: 'Orange', zh: '橙子', say: 'orange' },
    { emoji: '🦉', en: 'Owl', zh: '猫头鹰', say: 'owl' },
    { emoji: '🐙', en: 'Octopus', zh: '章鱼', say: 'octopus' },
    { emoji: '🧅', en: 'Onion', zh: '洋葱', say: 'onion' },
  ]},
  { letter: 'P', words: [
    { emoji: '🐷', en: 'Pig', zh: '猪', say: 'pig' },
    { emoji: '🍕', en: 'Pizza', zh: '披萨', say: 'pizza' },
    { emoji: '🐧', en: 'Penguin', zh: '企鹅', say: 'penguin' },
    { emoji: '🦚', en: 'Peacock', zh: '孔雀', say: 'peacock' },
  ]},
  { letter: 'Q', words: [
    { emoji: '👸', en: 'Queen', zh: '女王', say: 'queen' },
    { emoji: '🐦', en: 'Quail', zh: '鹌鹑', say: 'quail' },
    { emoji: '❓', en: 'Question', zh: '问号', say: 'question mark' },
  ]},
  { letter: 'R', words: [
    { emoji: '🐰', en: 'Rabbit', zh: '兔子', say: 'rabbit' },
    { emoji: '🌈', en: 'Rainbow', zh: '彩虹', say: 'rainbow' },
    { emoji: '🤖', en: 'Robot', zh: '机器人', say: 'robot' },
    { emoji: '🌹', en: 'Rose', zh: '玫瑰', say: 'rose' },
  ]},
  { letter: 'S', words: [
    { emoji: '🐍', en: 'Snake', zh: '蛇', say: 'snake' },
    { emoji: '⭐', en: 'Star', zh: '星星', say: 'star' },
    { emoji: '🌞', en: 'Sun', zh: '太阳', say: 'sun' },
    { emoji: '🍓', en: 'Strawberry', zh: '草莓', say: 'strawberry' },
  ]},
  { letter: 'T', words: [
    { emoji: '🐯', en: 'Tiger', zh: '老虎', say: 'tiger' },
    { emoji: '🍅', en: 'Tomato', zh: '西红柿', say: 'tomato' },
    { emoji: '🌳', en: 'Tree', zh: '大树', say: 'tree' },
    { emoji: '🚂', en: 'Train', zh: '火车', say: 'train' },
  ]},
  { letter: 'U', words: [
    { emoji: '☂️', en: 'Umbrella', zh: '雨伞', say: 'umbrella' },
    { emoji: '🦄', en: 'Unicorn', zh: '独角兽', say: 'unicorn' },
    { emoji: '⬆️', en: 'Up', zh: '向上', say: 'up' },
  ]},
  { letter: 'V', words: [
    { emoji: '🎻', en: 'Violin', zh: '小提琴', say: 'violin' },
    { emoji: '🌋', en: 'Volcano', zh: '火山', say: 'volcano' },
    { emoji: '🚐', en: 'Van', zh: '面包车', say: 'van' },
  ]},
  { letter: 'W', words: [
    { emoji: '🍉', en: 'Watermelon', zh: '西瓜', say: 'watermelon' },
    { emoji: '🐳', en: 'Whale', zh: '鲸鱼', say: 'whale' },
    { emoji: '🐺', en: 'Wolf', zh: '狼', say: 'wolf' },
    { emoji: '💧', en: 'Water', zh: '水', say: 'water' },
  ]},
  { letter: 'X', words: [
    { emoji: '📦', en: 'Box', zh: '盒子', say: 'box' },
    { emoji: '🦊', en: 'Fox', zh: '狐狸', say: 'fox' },
  ]},
  { letter: 'Y', words: [
    { emoji: '🟡', en: 'Yellow', zh: '黄色', say: 'yellow' },
    { emoji: '🧶', en: 'Yarn', zh: '毛线', say: 'yarn' },
    { emoji: '🥡', en: 'Yam', zh: '山药', say: 'yam' },
  ]},
  { letter: 'Z', words: [
    { emoji: '🦓', en: 'Zebra', zh: '斑马', say: 'zebra' },
    { emoji: '🤐', en: 'Zipper', zh: '拉链', say: 'zipper' },
    { emoji: '🦈', en: 'Zap', zh: '闪电', say: 'zap' },
  ]},
];

const LETTER_INDEX = {};
LETTERS.forEach((item, i) => { LETTER_INDEX[item.letter] = i; });

function letterData(l) {
  return LETTERS[LETTER_INDEX[l]];
}

function nextLetter(l) {
  return LETTERS[(LETTER_INDEX[l] + 1) % LETTERS.length].letter;
}

function prevLetter(l) {
  return LETTERS[(LETTER_INDEX[l] - 1 + LETTERS.length) % LETTERS.length].letter;
}
