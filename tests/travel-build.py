"""Data/fallback tests for the static travel renderer; no dependencies."""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('travel', ROOT/'tools/build-travel.py')
travel = importlib.util.module_from_spec(spec)
spec.loader.exec_module(travel)


class TravelBuildTests(unittest.TestCase):
    def test_missing_optional_content(self):
        output = travel.render({'destinations':[{'destination':'A new place'}]})
        self.assertIn('A photograph will live here.', output)
        self.assertIn('The full story is still being written.', output)
        self.assertIn('PREVIEW JOURNAL', output)

    def test_empty_collection(self):
        output = travel.render({})
        self.assertIn('The first series is on its way.',output)
        self.assertNotIn('{{',output)

    def test_html_is_escaped_and_ids_are_unique(self):
        output = travel.render({'intro':'<script>bad()</script>', 'destinations':[{'destination':'Test','id':'duplicate'},{'destination':'Test','id':'duplicate'}]})
        self.assertIn('&lt;script&gt;',output)
        self.assertEqual(output.count('id="story-duplicate"'),1)
        self.assertEqual(output.count('id="story-duplicate-next"'),1)

    def test_invalid_coordinates_are_not_rendered(self):
        output = travel.render({'destinations':[{'destination':'Unknown','coordinates':{'lat':999,'lng':'invalid'}}]})
        self.assertNotIn('data-stop=',output)

    def test_real_content_can_be_indexed(self):
        output = travel.render({'sample':False})
        self.assertNotIn('noindex',output)
        self.assertNotIn('Dummy trips',output)

    def test_single_destination_and_hemispheres(self):
        output = travel.travel_map(travel.normalize({'destinations':[{'destination':'Somewhere','coordinates':{'lat':-12,'lng':-70}}]}))
        self.assertIn('left:50.00%;top:50.00%',output)
        self.assertIn('12.0000° S / 70.0000° W',output)

    def test_incomplete_coordinates(self):
        for point in (None, [], 'unknown', {'lat':10}):
            output = travel.render({'destinations':[{'destination':'Somewhere','coordinates':point}]})
            self.assertNotIn('data-stop=',output)


if __name__ == '__main__':
    unittest.main()
