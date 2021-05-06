import readline from 'readline';

export function readUserInput(question: string): Promise<string> {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readlineInterface.question(question, (answer: string) => {
      resolve(answer);
      readlineInterface.close();
    });
  });
}

export function sleepBy(callback: () => Promise<boolean>, milisec: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      if (await callback()) {
        clearInterval(timer);
        resolve();
      }
    }, milisec);
  });
}

export function getFileName(filePath: string): string {
  return filePath.split('/').pop() || '';
}

export function getExtension(filePath: string): string {
  return (filePath.split('.').pop() || '').toLowerCase();
}

export function castDevice(str: string): 'desktop' | 'mobile' {
  switch (str) {
    case 'mobile':
      return 'mobile';
    default:
      return 'desktop';
  }
}

export function castSubContentType(str: string): 'js' | 'css' {
  switch (str) {
    case 'css':
      return 'css';
    default:
      return 'js';
  }
}

export function isUrl(str: string): boolean {
  return /^https?:\/\/.*/i.test(str);
}

export function outputMessage(str: string): void {
  // eslint-disable-next-line no-console
  console.log(str);
}
