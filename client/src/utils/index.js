import FileSaver from 'file-saver';

import{prompts} from'../constants';

export function getRandomPrompt(genre){
    const genrePrompts = prompts[genre];
    
    if (!genrePrompts) {
        throw new Error("Invalid genre provided.");
    }

    const randomIndex = Math.floor(Math.random() * genrePrompts.length);
    const randomPrompt = genrePrompts[randomIndex];

    return randomPrompt;
}

export async function downloadImage(_id, photo){
    FileSaver.saveAs(photo, `download-${_id}.jpg`);
}