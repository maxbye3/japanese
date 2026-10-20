(() => {
  'use strict';

  const ROLLS = [
    ['Salmon avocado roll', '#EF8A6B', '#83A66C', '#F5D779'],
    ['Tuna roll', '#CA6060', '#EAB2A1', '#98AE74'],
    ['Cucumber roll', '#75A373', '#B9CD8B', '#E4E9BC'],
    ['California roll', '#F0BC97', '#91AF72', '#E9CC72'],
    ['Prawn tempura roll', '#DAA64F', '#F4D48D', '#78A16E'],
    ['Spicy salmon roll', '#ED906B', '#B95F49', '#86A46C'],
    ['Rainbow roll', '#D57478', '#EFA87A', '#8BAB75'],
    ['Dragon roll', '#A97850', '#91B577', '#EACB77'],
  ];
  const illustrations = new Map();

  function get(index) {
    if (illustrations.has(index)) return illustrations.get(index);
    const specialHue = (index * 137.508) % 360;
    const [name, filling, green, accent] = ROLLS[index] || [
      'Chef’s special roll ' + (index + 1),
      `hsl(${specialHue.toFixed(2)}, 55%, 66%)`,
      `hsl(${((specialHue + 95) % 360).toFixed(2)}, 35%, 56%)`,
      `hsl(${((specialHue + 40) % 360).toFixed(2)}, 65%, 74%)`,
    ];
    const maki = (x, y) => `<g transform="translate(${x} ${y})">
      <path d="M0 18V36C0 47 58 47 58 36V18Z" fill="#34584A" stroke="#294B40" stroke-width="2"/>
      <path d="M6 33C17 38 40 39 51 33" stroke="#557666" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="29" cy="18" rx="29" ry="17" fill="#FFFEF2" stroke="#34584A" stroke-width="3"/>
      <ellipse cx="29" cy="18" rx="21" ry="11" fill="#F3E9CC"/>
      <path d="M17 13L31 10L35 21L21 25Z" fill="${filling}"/>
      <path d="M34 12L43 17L34 25L29 20Z" fill="${green}"/>
      <ellipse cx="24" cy="17" rx="4" ry="3" fill="${accent}"/>
      <path d="M10 16L12 15M43 25L46 24M20 30L23 31" stroke="#D6CDB5" stroke-width="2" stroke-linecap="round"/>
    </g>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none">
      <ellipse cx="80" cy="136" rx="62" ry="10" fill="#D4BE91" opacity=".3"/>
      ${maki(18, 34)}${maki(82, 57)}${maki(29, 88)}
      <path d="M110 28L113 18L116 28L126 31L116 34L113 44L110 34L100 31Z" fill="#E4B649"/>
      <circle cx="23" cy="83" r="3" fill="${filling}"/>
    </svg>`;
    const collectible = { name, src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) };
    illustrations.set(index, collectible);
    return collectible;
  }

  window.SushiRolls = { get };
})();
