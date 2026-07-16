export function mergeLines(lines: string[]): string[] {

  const merged: string[] = [];

  let buffer = "";

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i].trim();

    if (!line) continue;


    // course code line
    if (
      /^[A-Za-z]{2,5}\s?\d{3,5}$/.test(line)
    ) {

      buffer = line;
      continue;

    }


    // append next title line
    if (
      buffer &&
      !/^(Mr\.|Ms\.|Dr\.)/.test(line)
    ) {

      buffer += " " + line;


      // keep collecting until teacher starts
      continue;

    }


    if (
      /^(Mr\.|Ms\.|Dr\.)/.test(line)
    ) {

      if(buffer){

        merged.push(buffer);
        buffer="";

      }

      merged.push(line);

      continue;

    }


    merged.push(line);

  }


  if(buffer){
    merged.push(buffer);
  }


  return merged;
}