// Messages quotidiens pour maman. Ils tournent automatiquement, un par jour.
// Pour en ajouter, il suffit d'ajouter une ligne entre guillemets, suivie d'une virgule.
window.MESSAGES = [
  "Coucou maman ! J'espère que tu vas passer une belle journée. Je t'aime fort.",
  "Bonjour maman, pense à toi aujourd'hui, prends un peu de temps rien que pour toi. Je t'aime.",
  "Coucou maman, je voulais juste te dire que tu es la meilleure. Bonne journée !",
  "Bonjour ma petite maman, que ta journée soit aussi douce que toi. Gros bisous.",
  "Coucou maman ! Un petit mot pour te dire que je pense à toi. Passe une belle journée.",
  "Maman, merci pour tout ce que tu fais, chaque jour. Je t'aime énormément.",
  "Bonjour maman, j'espère que le soleil brille chez toi aujourd'hui. Et sinon, c'est toi mon soleil.",
  "Coucou maman, n'oublie pas de sourire aujourd'hui, ça te va si bien. Je t'embrasse.",
  "Bonjour maman ! Je te souhaite une journée pleine de petits bonheurs. Je t'aime.",
  "Coucou maman, un café, une fleur, et une pensée pour toi. Bonne journée !",
  "Maman, tu es ma plus belle fleur. Passe une très belle journée.",
  "Bonjour ma maman chérie, je t'envoie plein de courage et de bisous pour la journée.",
  "Coucou maman, j'espère que tu as bien dormi. Prends soin de toi aujourd'hui.",
  "Bonjour maman, merci d'être toujours là pour moi. Je t'aime plus que tout.",
  "Coucou maman ! Si tu lis ce message, c'est que ta journée commence bien. Bisous.",
  "Maman, chaque jour je mesure la chance que j'ai de t'avoir. Belle journée à toi.",
  "Bonjour maman, un petit tour au jardin aujourd'hui ? Les fleurs t'attendent. Je t'aime.",
  "Coucou maman, tu es forte, tu es belle, tu es géniale. N'oublie jamais ça.",
  "Bonjour ma maman, je te souhaite une journée aussi lumineuse que ton sourire.",
  "Coucou maman, je pense à toi et je t'envoie un énorme câlin à distance.",
  "Maman, merci pour ta patience, ta douceur et ton amour. Bonne journée !",
  "Bonjour maman, que cette journée t'apporte calme et sérénité. Je t'aime fort.",
  "Coucou maman ! Tu mérites tout le bonheur du monde. Passe une belle journée.",
  "Bonjour ma petite maman, pense à boire ton thé tranquillement ce matin. Bisous.",
  "Coucou maman, je suis fier(e) d'être ton enfant. Je t'aime.",
  "Maman, les plus belles choses de ma vie, je te les dois. Belle journée !",
  "Bonjour maman, le monde est plus beau avec toi dedans. Je t'embrasse très fort.",
  "Coucou maman, aujourd'hui, fais quelque chose qui te fait plaisir. Tu le mérites.",
  "Bonjour maman, je t'envoie des ondes positives pour toute la journée. Bisous.",
  "Coucou maman ! Même loin, tu es toujours dans mon cœur. Bonne journée.",
  "Maman, tu as le pouce vert et le cœur en or. Je t'aime.",
  "Bonjour ma maman adorée, que ta journée soit remplie de douceur.",
  "Coucou maman, merci pour tous ces bons petits plats et ces câlins. Belle journée !",
  "Bonjour maman, prends le temps de regarder le ciel aujourd'hui. Je pense à toi.",
  "Coucou maman, tu es mon exemple et ma plus grande fierté. Je t'aime.",
  "Maman, j'espère que ta journée sera belle et légère. Gros bisous.",
  "Bonjour maman, un nouveau jour, une nouvelle fleur, et toujours le même amour pour toi.",
  "Coucou maman ! Juste un petit mot pour illuminer ton matin. Je t'aime fort.",
  "Bonjour ma maman, tu es douce comme un pétale et forte comme un chêne. Belle journée.",
  "Coucou maman, j'espère que ton jardin se porte bien, et toi aussi ! Bisous.",
  "Maman, tu n'as pas idée à quel point tu comptes pour moi. Passe une belle journée.",
  "Bonjour maman, respire, souris, profite. Aujourd'hui est une belle journée.",
  "Coucou maman, je t'aime hier, aujourd'hui, demain et pour toujours.",
  "Bonjour maman ! Que ta journée soit fleurie et ensoleillée. Je t'embrasse.",
  "Coucou ma maman, merci d'avoir fait de moi qui je suis. Belle journée à toi.",
];

// Messages spéciaux pour certaines dates (format "MM-JJ"). Ils remplacent le message du jour.
// Exemple pour un anniversaire le 14 mars : "03-14": "Joyeux anniversaire maman ! ..."
window.MESSAGES_SPECIAUX = {
  "01-01": "Bonne année maman ! Je te souhaite douze mois de bonheur, de santé et de belles fleurs. Je t'aime.",
  "12-25": "Joyeux Noël maman ! Merci pour tous ces Noëls magiques que tu m'as offerts. Je t'aime fort.",
  "02-14": "Coucou maman, aujourd'hui c'est la Saint-Valentin, et mon premier amour, c'est toi. Bisous !",
  // "03-14": "Joyeux anniversaire maman ! ...",
};

// Message de la fête des mères (calculée automatiquement, dernier dimanche de mai en France).
window.MESSAGE_FETE_DES_MERES =
  "Bonne fête maman ! Aujourd'hui c'est ta journée. Merci d'être la maman la plus merveilleuse du monde. Je t'aime infiniment.";
