import { redirect } from 'next/navigation';
import { defaultLocale } from '@/locale/config';

export default function TestSuggestRedirect() {
    // Redirect to the default locale version of the test page
    redirect(`/${defaultLocale}/test-suggest`);
}
