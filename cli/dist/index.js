"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitDiffSummary = getGitDiffSummary;
const promises_1 = require("node:timers/promises");
const p = __importStar(require("@clack/prompts"));
const picocolors_1 = __importDefault(require("picocolors"));
const simple_git_1 = __importDefault(require("simple-git"));
function authorizeWithX() {
    return __awaiter(this, void 0, void 0, function* () {
        const s = p.spinner();
        s.start('Open the link in your browser to authorize https:localhost:3000');
        // await setTimeout(2500);
        s.stop('You are now authorized');
    });
}
function getGitDiffSummary() {
    return __awaiter(this, void 0, void 0, function* () {
        const git = (0, simple_git_1.default)({ baseDir: process.cwd() });
        try {
            const status = yield git.status();
            const stagedDiff = yield git.diff(['--cached']); // Staged changes
            const unstagedDiff = yield git.diff(); // Unstaged changes
            const changedFiles = status.files.map(f => `- ${f.path} (${f.working_dir})`).join('\n') || 'No file changes detected';
            const summary = `\n📦 Git Status:\n${changedFiles}` +
                `\n\n🧾 Staged Diff:\n${stagedDiff || 'No staged changes'}` +
                `\n\n🧾 Unstaged Diff:\n${unstagedDiff || 'No unstaged changes'}`;
            return summary;
        }
        catch (err) {
            console.error('❌ Git error:', err);
            return 'Git data not available. Are you in a Git repository?';
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Authorize with x
        // 2. Get the git diff and status
        // 3. Pass it to gemini and generate tweets
        // 4. Update in main app 
        console.clear();
        // await setTimeout(1000);
        p.updateSettings({
            aliases: {
                k: 'up',
                j: 'down',
                h: 'left',
                l: 'right',
            },
        });
        p.intro(`${picocolors_1.default.bgYellow(picocolors_1.default.black(' 💩shitpost '))} ${picocolors_1.default.dim('- Built something cool? Shitpost it!')}`);
        yield authorizeWithX();
        const summary = yield getGitDiffSummary();
        console.log(summary);
        return;
        const project = yield p.group({
            path: () => p.text({
                message: 'Where should we create your project?',
                placeholder: './sparkling-solid',
                validate: (value) => {
                    if (!value)
                        return 'Please enter a path.';
                    if (value[0] !== '.')
                        return 'Please enter a relative path.';
                },
            }),
            password: () => p.password({
                message: 'Provide a password',
                validate: (value) => {
                    if (!value)
                        return 'Please enter a password.';
                    if (value.length < 5)
                        return 'Password should have at least 5 characters.';
                },
            }),
            type: ({ results }) => p.select({
                message: `Pick a project type within "${results.path}"`,
                initialValue: 'ts',
                maxItems: 5,
                options: [
                    { value: 'ts', label: 'TypeScript' },
                    { value: 'js', label: 'JavaScript' },
                    { value: 'rust', label: 'Rust' },
                    { value: 'go', label: 'Go' },
                    { value: 'python', label: 'Python' },
                    { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
                ],
            }),
            tools: () => p.multiselect({
                message: 'Select additional tools.',
                initialValues: ['prettier', 'eslint'],
                options: [
                    { value: 'prettier', label: 'Prettier', hint: 'recommended' },
                    { value: 'eslint', label: 'ESLint', hint: 'recommended' },
                    { value: 'stylelint', label: 'Stylelint' },
                    { value: 'gh-action', label: 'GitHub Action' },
                ],
            }),
            install: () => p.confirm({
                message: 'Install dependencies?',
                initialValue: false,
            }),
        }, {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        });
        if (project.install) {
            const s = p.spinner();
            s.start('Installing via pnpm');
            yield (0, promises_1.setTimeout)(2500);
            s.stop('Installed via pnpm');
        }
        const nextSteps = `cd ${project.path}        \n${project.install ? '' : 'pnpm install\n'}pnpm dev`;
        p.note(nextSteps, 'Next steps.');
        p.outro(`Problems? ${picocolors_1.default.underline(picocolors_1.default.cyan('https://example.com/issues'))}`);
    });
}
main().catch(console.error);
