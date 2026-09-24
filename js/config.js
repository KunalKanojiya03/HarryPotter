// All the themed content lives here: houses, professors, voices, creatures, spells and lines.
// Placeholders: {name} student, {house} house name, {task} task name(s), {pct} percentage, {area} life area.
window.HP = {
  houses: {
    gryffindor: { name: 'Gryffindor', crest: '🦁', primary: '#7f0909', accent: '#e8b33a', trait: 'courage, daring and a heart that refuses to back down' },
    slytherin: { name: 'Slytherin', crest: '🐍', primary: '#1a5e2a', accent: '#5fcf86', trait: 'ambition, cunning and a hunger to be great' },
    ravenclaw: { name: 'Ravenclaw', crest: '🦅', primary: '#1f3a8a', accent: '#8fb0ff', trait: 'a quick mind, curiosity and a love of learning' },
    hufflepuff: { name: 'Hufflepuff', crest: '🦡', primary: '#9a6b00', accent: '#f2c744', trait: 'patience, loyalty and the stamina to keep going' },
  },

  // Each life area is a "subject" taught by a professor.
  areas: {
    learning: { label: 'Learning & Study', subject: 'Transfiguration', prof: 'mcgonagall', icon: '📚' },
    discipline: { label: 'Discipline & Habits', subject: 'Potions', prof: 'snape', icon: '🧪' },
    health: { label: 'Health & Self-care', subject: 'Hospital Wing', prof: 'pomfrey', icon: '🩺' },
    fitness: { label: 'Fitness & Exercise', subject: 'Flying Lessons', prof: 'hooch', icon: '🧹' },
    work: { label: 'Work & Career', subject: "Headmaster's Office", prof: 'dumbledore', icon: '🔮' },
    home: { label: 'Home & Chores', subject: 'Care of Magical Creatures', prof: 'hagrid', icon: '🏡' },
    finance: { label: 'Money & Finance', subject: 'Gringotts', prof: 'griphook', icon: '💰' },
    mind: { label: 'Mind & Wellbeing', subject: 'Defence Against the Dark Arts', prof: 'lupin', icon: '🍫' },
  },

  // Voice profiles use free browser voices. "hints" are preferred voice names, best first
  // (Microsoft Edge "Natural" voices and Google UK voices sound the best).
  professors: {
    snape: {
      name: 'Professor Snape', emoji: '🧪',
      voice: { gender: 'male', pitch: 0.55, rate: 0.82, hints: ['Ryan', 'Thomas', 'George', 'Daniel', 'Oliver', 'Arthur', 'Google UK English Male'] },
      howler: [
        '{name}. It appears {task} was simply beyond you today. How... unsurprising. Five points from {house}.',
        'I had hoped, foolishly, that {task} lay within your limited abilities. I see I was mistaken. Do try to disappoint me less tomorrow.',
        'Discipline, {name}, is brewed slowly, over many days, like any potion worth drinking. You have let today\'s cauldron boil over. {task}... undone.',
        'Silence. I do not want excuses. I want {task} completed. Tomorrow. Without fail.',
      ],
      praise: ['Adequate. Barely.', 'Hm. It is done. Do not expect applause.', 'Acceptable... for once.', 'Perhaps you are not entirely hopeless, {name}.'],
      grades: {
        good: ['{pct} in {area}. Even a troll can be trained, it seems. Do not let it go to your head.', '{pct}. I find... nothing to criticise. How irritating.'],
        mid: ['{pct}. Mediocre. The potion is lukewarm, neither ruined nor useful.', '{pct}. You are coasting, {name}. I notice these things.'],
        bad: ['{pct}. I have seen more discipline in a flobberworm.', '{pct}. Pathetic. Your cauldron is empty and so, it seems, is your resolve.'],
      },
    },
    mcgonagall: {
      name: 'Professor McGonagall', emoji: '🐈',
      voice: { gender: 'female', pitch: 0.95, rate: 0.95, hints: ['Fiona', 'Scotland', 'Scottish', 'Sonia', 'Libby', 'Hazel', 'Susan', 'Serena', 'Kate', 'Google UK English Female'] },
      howler: [
        '{name}! I am deeply disappointed. {task} was on your timetable and you let it slip away. I expect far better from a member of {house}, and I shall have it by tomorrow.',
        'Do you imagine knowledge simply transfigures itself into your head? {task}, left undone! Five points from {house}. See that it does not happen again.',
        '{name}, a witch or wizard is only as good as their daily practice. You missed {task}. Sit up straight, and do better tomorrow.',
      ],
      praise: ['Well done, {name}. Ten points to {house}.', 'Excellent. That is precisely how it is done.', 'Very good. Keep this up and you may yet make me proud.', 'Hmph. Rather impressive, I must say.'],
      grades: {
        good: ['{pct} in {area}. Excellent work. I may even allow myself a ginger biscuit.', '{pct}. Exemplary. This is the standard I expect.'],
        mid: ['{pct} in {area}. Acceptable, but I know perfectly well you are capable of more.', '{pct}. Adequate. Adequate is not the same as good, {name}.'],
        bad: ['{pct} in {area}?! This will not do. We shall discuss this in my office.', '{pct}. I am frankly astonished. Pull yourself together.'],
      },
    },
    pomfrey: {
      name: 'Madam Pomfrey', emoji: '🩺',
      voice: { gender: 'female', pitch: 1.15, rate: 1.05, hints: ['Libby', 'Maisie', 'Sonia', 'Kate', 'Serena', 'Hazel', 'Google UK English Female'] },
      howler: [
        '{name}! What have you been doing to yourself? You skipped {task}! I can mend a broken bone in seconds, but I cannot mend neglect. Rest, water, and do better tomorrow.',
        'Honestly! {task}, forgotten again. Your body is not a broomstick you can leave in the shed, young one. Look after it!',
        'I have half a mind to confine you to the Hospital Wing. {task}. Tomorrow. Healer\'s orders.',
      ],
      praise: ['There now, that\'s better. Good for you.', 'Very sensible. Your body thanks you.', 'Now that\'s what I like to see.'],
      grades: {
        good: ['{pct}. Healthy as a hippogriff! Keep it up, dear.', '{pct}. Wonderful. I shan\'t be seeing you in my ward any time soon.'],
        mid: ['{pct}. Not bad, but you are still skipping things. I can tell, you know.', '{pct}. Some days yes, some days no. Your body likes routine, dear.'],
        bad: ['{pct}?! Straight to bed, and a dose of Pepperup Potion for you.', '{pct}. This worries me, {name}. Please, look after yourself.'],
      },
    },
    hooch: {
      name: 'Madam Hooch', emoji: '🧹',
      voice: { gender: 'female', pitch: 1.0, rate: 1.15, hints: ['Sonia', 'Hazel', 'Susan', 'Libby', 'Kate', 'Google UK English Female'] },
      howler: [
        'What are you waiting for, {name}? {task}: missed! Legs lazy, broom grounded. Tomorrow, when I blow my whistle, you move!',
        'Feet off the ground means effort, {name}! {task} did not happen. The Quidditch pitch has no room for couch potatoes!',
        'Mount your broom, kick off hard, that\'s how it works! Not by skipping {task}. Again tomorrow, and properly!',
      ],
      praise: ['That\'s it! Now you\'re flying!', 'Good form, {name}! Keep that pace!', 'Excellent! Ten laps of glory!'],
      grades: {
        good: ['{pct}! You fly like a Seeker, {name}. Keep it up!', '{pct}. Strong, fast and steady. Team material!'],
        mid: ['{pct}. You\'re airborne, but wobbling. More practice!', '{pct}. Decent, but I want to see you pushing harder.'],
        bad: ['{pct}?! You\'re still on the ground! Up, up, UP!', '{pct}. That broom is gathering dust, {name}.'],
      },
    },
    dumbledore: {
      name: 'Professor Dumbledore', emoji: '🔮',
      voice: { gender: 'male', pitch: 0.8, rate: 0.85, hints: ['George', 'Arthur', 'Daniel', 'Thomas', 'Ryan', 'Google UK English Male'] },
      howler: [
        'Ah, {name}. It seems {task} drifted past you today, like a lemon drop forgotten in a pocket. It is not our stumbles that define us, but how we rise from them. Rise well tomorrow.',
        'My dear {name}. {task} went unattended today. Do not despair. Even the brightest phoenix must sometimes burn before it rises again.',
        'Great things are built from small, ordinary habits, {name}, kept day after day. {task} was set aside today. Tomorrow offers a fresh page.',
      ],
      praise: ['Splendid, {name}. Truly splendid.', 'Well done. Small deeds, done daily, are the most powerful magic of all.', 'Excellent. Have a lemon drop.'],
      grades: {
        good: ['{pct}. Remarkable, {name}. You are becoming exactly who you meant to be.', '{pct}. I am very proud. Do not forget to rest as well as work.'],
        mid: ['{pct}. A good foundation, {name}. Now let us build a tower upon it.', '{pct}. Progress is rarely a straight line. Keep walking.'],
        bad: ['{pct}. Something is weighing on you, I think. What small step could you take first?', '{pct}. Even the Headmaster has difficult terms. Begin again, gently.'],
      },
    },
    hagrid: {
      name: 'Hagrid', emoji: '🐕',
      voice: { gender: 'male', pitch: 0.45, rate: 0.92, hints: ['Daniel', 'George', 'Ryan', 'Thomas', 'Google UK English Male'] },
      howler: [
        'Blimey, {name}! Yeh didn\'t do {task}? That\'s not like yeh... well, maybe it is a bit. Don\'t worry, we\'ll sort it out tomorrow, eh? Jus\' don\'t tell Professor McGonagall I said that.',
        'Oh, {name}... {task}, left undone. Fang\'s that disappointed he\'s gone an\' hidden under the table. Come on now, yeh can do better than this!',
        'Now listen \'ere, {name}. A creature that\'s not fed gets grumpy, an\' so does a home that\'s not looked after. {task}! Tomorrow, righ\'?',
      ],
      praise: ['Brilliant! Yer a star, {name}!', 'Tha\'s the spirit! Yeh\'ve got it!', 'Great stuff! Fancy a rock cake?'],
      grades: {
        good: ['{pct}! Yeh\'ve got that place lookin\' lovely, {name}!', '{pct}! Even Fang\'s impressed, an\' he\'s hard ter impress.'],
        mid: ['{pct}. Not bad, not bad. Bit messy round the edges, mind.', '{pct}. Yeh\'re gettin\' there. Keep at it!'],
        bad: ['{pct}... blimey. It\'s lookin\' like my hut in there!', '{pct}. Don\'t fret, I\'ll help yeh tidy up. Tomorrow, eh?'],
      },
    },
    griphook: {
      name: 'Griphook of Gringotts', emoji: '💰',
      voice: { gender: 'male', pitch: 1.35, rate: 0.95, hints: ['Thomas', 'Ryan', 'Oliver', 'Daniel', 'Google UK English Male'] },
      howler: [
        'Wizard. You neglected {task}. Gringotts does not look kindly upon those who squander their gold, or their time. The interest on carelessness is... considerable.',
        '{name}. A goblin never forgets a debt. {task} is now owed, and it will be collected. With interest.',
        'Your vault grows lighter, {name}, every time {task} is ignored. Gold does not guard itself.',
      ],
      praise: ['Acceptable. Your vault is... marginally safer.', 'Hm. A wise investment of your time.', 'Gringotts approves. For now.'],
      grades: {
        good: ['{pct}. Your vault is well guarded. Gringotts is... satisfied.', '{pct}. Shrewd. Perhaps you have some goblin blood.'],
        mid: ['{pct}. Your accounts are in order, mostly. Mostly is not enough.', '{pct}. Some gold saved, some gold wasted.'],
        bad: ['{pct}. Your vault is nearly empty, wizard. Act, before the dragons get hungry.', '{pct}. Gringotts is considering... closing your account.'],
      },
    },
    lupin: {
      name: 'Professor Lupin', emoji: '🍫',
      voice: { gender: 'male', pitch: 0.9, rate: 0.9, hints: ['Ryan', 'Thomas', 'Oliver', 'Daniel', 'Google UK English Male'] },
      howler: [
        '{name}, you missed {task}. That\'s alright. Even the bravest of us have days when the Dementors feel close. Have some chocolate, breathe, and we\'ll face it together tomorrow.',
        'Hey. {task} didn\'t happen today, and that is not the end of the world. Be gentle with yourself, {name}. Tomorrow we try again, side by side.',
        'The darkest creatures feed on neglect, {name}, and that includes neglect of yourself. {task} matters. Tomorrow, make a little time for you.',
      ],
      praise: ['Well done. I\'m proud of you, {name}.', 'That\'s the way. A little light goes a long way.', 'Excellent. Have a piece of chocolate, you\'ve earned it.'],
      grades: {
        good: ['{pct}. Your Patronus must be blazing, {name}. Wonderful.', '{pct}. You are looking after yourself. That is real magic.'],
        mid: ['{pct}. Some good days, some hard ones. That is perfectly human.', '{pct}. You are learning to fight the Dementors. Keep going.'],
        bad: ['{pct}. The Dementors have been close lately. Please be kind to yourself.', '{pct}. Let\'s start small: five quiet minutes tomorrow. Together.'],
      },
    },
  },

  sortingHat: { gender: 'male', pitch: 0.7, rate: 0.85, hints: ['George', 'Arthur', 'Daniel', 'Thomas', 'Google UK English Male'] },

  sorting: [
    { q: 'A troll has cornered a stranger in the corridor. You…', a: [['Charge in, wand raised', 'gryffindor'], ['Rig a clever trap to outwit it', 'ravenclaw'], ['Make sure everyone gets out safely', 'hufflepuff'], ['Weigh what you stand to gain first', 'slytherin']] },
    { q: 'How would you most like to be remembered?', a: [['The Bold', 'gryffindor'], ['The Wise', 'ravenclaw'], ['The Kind', 'hufflepuff'], ['The Great', 'slytherin']] },
    { q: 'Choose a path through the Forbidden Forest:', a: [['The dark path where something is howling', 'gryffindor'], ['The path lined with glowing runes', 'ravenclaw'], ['The sunny path past the pumpkin patch', 'hufflepuff'], ['The silver path to a hidden treasure', 'slytherin']] },
    { q: 'Your perfect Saturday at Hogwarts:', a: [['Playing in the Quidditch final', 'gryffindor'], ['A quiet corner of the library', 'ravenclaw'], ['A feast in the kitchens with friends', 'hufflepuff'], ['Secretly mastering advanced spells', 'slytherin']] },
  ],

  starterTasks: [
    ['Drink a glass of water after waking', 'health', '07:00', true],
    ['5 minutes of quiet breathing', 'mind', '07:30', true],
    ['Deep-focus block on my most important work', 'work', '10:00', true],
    ['30-minute walk or workout', 'fitness', '18:00', true],
    ['Tidy my room for 10 minutes', 'home', '20:00', false],
    ['Read for 20 minutes', 'learning', '21:00', true],
    ['Write down today\'s spending', 'finance', '21:30', false],
    ['Plan tomorrow and put the phone away', 'discipline', '22:30', false],
  ],

  // Missed tasks release creatures into your dungeon.
  creatures: {
    boggart: { name: 'Boggart', emoji: '🎭', hp: 2, taunt: 'It wears the shape of every habit you keep putting off.' },
    pixie: { name: 'Cornish Pixie', emoji: '🧚', hp: 1, taunt: 'It scatters your books and notes all over the castle.' },
    grindylow: { name: 'Grindylow', emoji: '🐙', hp: 2, taunt: 'It drags your health down into murky water.' },
    troll: { name: 'Mountain Troll', emoji: '👹', hp: 3, taunt: 'Big, slow and lazy, just like a skipped workout.' },
    redcap: { name: 'Red Cap', emoji: '👺', hp: 2, taunt: 'It lurks wherever deadlines were broken.' },
    doxy: { name: 'Doxy', emoji: '🦟', hp: 1, taunt: 'It infests the untidy corners of your home.' },
    niffler: { name: 'Niffler', emoji: '🦔', hp: 2, taunt: 'It is quietly stealing gold from your vault.' },
    dementor: { name: 'Dementor', emoji: '👻', hp: 3, taunt: 'It feeds on your energy and your good mood.' },
    horntail: { name: 'Hungarian Horntail', emoji: '🐉', hp: 6, taunt: 'A dragon awakened by an overrun dungeon. Beware!' },
  },
  areaCreature: { learning: 'pixie', discipline: 'boggart', health: 'grindylow', fitness: 'troll', work: 'redcap', home: 'doxy', finance: 'niffler', mind: 'dementor' },

  spells: [
    { id: 'lumos', name: 'Lumos', emoji: '💡', color: '#fff6b0', desc: 'Complete your first task.', check: s => s.totalDone >= 1 },
    { id: 'wingardium', name: 'Wingardium Leviosa', emoji: '🪶', color: '#c7f0ff', desc: 'Complete 10 tasks.', check: s => s.totalDone >= 10 },
    { id: 'protego', name: 'Protego', emoji: '🛡️', color: '#9ad0ff', desc: 'Reach a 3-day streak.', check: s => s.bestStreak >= 3 },
    { id: 'expelliarmus', name: 'Expelliarmus', emoji: '⚡', color: '#ff6b6b', desc: 'Defeat your first dungeon creature.', check: s => s.defeated >= 1 },
    { id: 'accio', name: 'Accio', emoji: '🧲', color: '#ffd28a', desc: 'Complete 5 tasks in a single day.', check: s => s.maxInDay >= 5 },
    { id: 'alohomora', name: 'Alohomora', emoji: '🗝️', color: '#e0c38a', desc: 'Redeem a missed task by completing it late.', check: s => s.lateDone >= 1 },
    { id: 'riddikulus', name: 'Riddikulus', emoji: '🤡', color: '#ffb3e6', desc: 'Defeat a Boggart.', check: s => (s.defeatedTypes.boggart || 0) >= 1 },
    { id: 'stupefy', name: 'Stupefy', emoji: '💥', color: '#ff4d4d', desc: 'Complete 50 tasks.', check: s => s.totalDone >= 50 },
    { id: 'patronum', name: 'Expecto Patronum', emoji: '🦌', color: '#e6f4ff', desc: 'Reach a 7-day streak. Every 7-day streak also grants a Patronus shield that blocks one missed task.', check: s => s.bestStreak >= 7 },
  ],

  prophet: {
    fresh: ['New Student Arrives at Hogwarts: Great Things Expected', 'Owls Deliver First Timetable to {name} of {house}'],
    great: ['{name} DAZZLES PROFESSORS WITH A FLAWLESS DAY', 'House Cup Hopes Soar After {name}\'s Perfect Performance', 'Ministry Considers Order of Merlin for {name}\'s Discipline'],
    good: ['Steady Progress for {name} of {house}, Say Sources', 'Professors Quietly Pleased with {name}\'s Efforts'],
    bad: ['Concern Grows as {name} Leaves Tasks Unfinished', 'Howlers Spotted Flying Toward the {house} Dormitory', 'Ministry Investigates the Missing Homework of {name}'],
    overrun: ['DUNGEONS OVERRUN! {n} Creatures Spotted Beneath Hogwarts', 'Terror Below: {n} Beasts Loose in the Dungeons'],
  },

  quotes: [
    'Even the smallest charm, cast daily, becomes powerful magic.',
    'A wand is only as good as the hand that practises with it.',
    'Courage is starting the task before you feel ready.',
    'Every habit is a spell you cast upon your future self.',
    'Brew slowly, stir patiently. Great potions and great lives take time.',
    'One page, one lap, one breath. That is how wizards are made.',
    'Your Patronus grows brighter with every promise you keep to yourself.',
    'Dementors hate routine. Keep yours.',
    'The castle stairs move. Keep climbing anyway.',
    'Mischief is fun; momentum is magic.',
  ],
};
